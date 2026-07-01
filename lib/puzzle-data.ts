import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Puzzle, PuzzleType } from '@/types/puzzle'
import { ensureDailyPuzzleForType, generateAndStoreDailyPuzzles } from './daily-generator'
import { getTodayDateEastern } from './daily-seed'

type PuzzleQuery = {
  type?: PuzzleType
  limit?: number
}

async function attachCompletionStatus(puzzle: Puzzle): Promise<Puzzle> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return puzzle

  const { data: score } = await supabase
    .from('scores')
    .select('id')
    .eq('puzzle_id', puzzle.id)
    .eq('user_id', user.id)
    .eq('completed', true)
    .maybeSingle()

  if (score) puzzle.completed = true
  return puzzle
}

export async function getPuzzles({ type, limit }: PuzzleQuery = {}): Promise<Puzzle[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('puzzles').select('*').order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  let puzzles = (data ?? []) as Puzzle[]

  const today = getTodayDateEastern()
  const hasToday = puzzles.some(p => p.is_daily && p.daily_date === today)

  if (!hasToday && !type) {
    console.log(`🌞 Today's puzzles missing, triggering generation for ${today}...`)
    generateAndStoreDailyPuzzles().catch(err => {
      console.error('❌ Failed to lazy-generate daily puzzles:', err)
    })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user && puzzles.length > 0) {
    const { data: scores } = await supabase
      .from('scores')
      .select('puzzle_id')
      .eq('user_id', user.id)
      .eq('completed', true)
      .in('puzzle_id', puzzles.map(p => p.id))

    if (scores) {
      const completedIds = new Set(scores.map(s => s.puzzle_id))
      puzzles.forEach(p => {
        if (completedIds.has(p.id)) p.completed = true
      })
    }
  }

  return puzzles
}

export async function getPuzzleById(id: string, type?: PuzzleType): Promise<Puzzle | null> {
  const supabase = await createServerSupabaseClient()

  if (id === 'daily') {
    const today = getTodayDateEastern()
    const puzzleType = type || 'sudoku'

    const { data: todayPuzzle } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('daily_date', today)
      .eq('type', puzzleType)
      .maybeSingle()

    if (todayPuzzle) {
      return attachCompletionStatus(todayPuzzle as Puzzle)
    }

    // Ensure today's seeded daily puzzle exists (logic & wordsearch rotate by date)
    try {
      const { puzzle } = await ensureDailyPuzzleForType(puzzleType, today)
      return attachCompletionStatus(puzzle as Puzzle)
    } catch (err) {
      console.error(`❌ Failed to ensure daily ${puzzleType} for ${today}:`, err)
      return null
    }
  }

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  if (type && data.type !== type) return null

  const puzzle = data as Puzzle

  // If it's a regular (non-daily) puzzle, randomize/generate fresh content for it!
  if (!puzzle.is_daily) {
    if (puzzle.type === 'jigsaw') {
      const difficulty = puzzle.difficulty
      const { generateJigsaw } = await import('./puzzle-generators')
      const jigsawData = generateJigsaw(difficulty)
      puzzle.puzzle_data = {
        image_url: jigsawData.image_url,
        pieces: jigsawData.pieces
      }
      puzzle.title = jigsawData.title
    } else if (puzzle.type === 'logic') {
      const difficulty = puzzle.difficulty
      const { LOGIC_PUZZLE_POOLS } = await import('./puzzle-generators')
      const pool = LOGIC_PUZZLE_POOLS[difficulty]
      const selected = pool[Math.floor(Math.random() * pool.length)]
      puzzle.puzzle_data = {
        question: selected.question,
        answer: selected.answer,
        hint: selected.hint,
        options: selected.options
      }
      puzzle.title = selected.title
    } else if (puzzle.type === 'wordsearch') {
      const difficulty = puzzle.difficulty
      const { WORD_BANKS, WORD_SEARCH_THEMES_INFO, generateWordSearch } = await import('./puzzle-generators')
      const banks = WORD_BANKS[difficulty]
      const chosenBankIndex = Math.floor(Math.random() * banks.length)
      const selectedBank = banks[chosenBankIndex]
      const count = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 8
      
      const shuffledBank = [...selectedBank].sort(() => Math.random() - 0.5)
      const words = shuffledBank.slice(0, count)
      
      const wsData = generateWordSearch(difficulty, words)
      puzzle.puzzle_data = wsData
      puzzle.title = WORD_SEARCH_THEMES_INFO[difficulty][chosenBankIndex] || puzzle.title
    }
  }

  return attachCompletionStatus(puzzle)
}
