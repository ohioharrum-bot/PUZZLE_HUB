import { v4 as uuidv4 } from 'uuid'
import { generateSudoku, generateWordSearch, generateLogicPuzzle, LOGIC_PUZZLE_POOLS, getLogicPuzzleBankIndex, WORD_BANKS } from './puzzle-generators'
import { generateAILogicPuzzle, generateAIWordSearchTheme, generateAIWordGuesser } from './ai-generator'
import { createAdminClient } from './supabase-admin'
import { getTodayDateEastern, getYesterdayDateEastern } from './daily-seed'
import type { PuzzleType } from '@/types/puzzle'

const JIGSAW_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"
]

async function getYesterdayPuzzleData(type: PuzzleType, today: string) {
  const supabase = createAdminClient()
  const yesterday = getYesterdayDateEastern(today)
  const { data } = await supabase
    .from('puzzles')
    .select('puzzle_data')
    .eq('is_daily', true)
    .eq('daily_date', yesterday)
    .eq('type', type)
    .maybeSingle()
  return data?.puzzle_data ?? null
}

function getYesterdayWordSearchAvoidBank(yesterdayData: { words?: string[] } | null, difficulty: 'easy' | 'medium' | 'hard') {
  if (!yesterdayData?.words?.length) return undefined
  const bankList = WORD_BANKS[difficulty]
  const idx = bankList.findIndex(bank => yesterdayData.words!.some(w => bank.includes(w)))
  return idx >= 0 ? idx : undefined
}

async function buildDailyPuzzleData(type: PuzzleType, today: string) {
  const difficulty = 'medium' as const
  let puzzleData: any
  let solutionData: any = null
  let title = `Daily ${type === 'wordle' ? 'Word Guesser' : type.replace('-', ' ').charAt(0).toUpperCase() + type.replace('-', ' ').slice(1)} - ${today}`

  if (type === 'sudoku') {
    const { puzzle, solution } = generateSudoku(difficulty)
    puzzleData = puzzle
    solutionData = { solution }
  } else if (type === 'wordsearch') {
    const yesterdayData = await getYesterdayPuzzleData('wordsearch', today)
    const avoidBankIndex = getYesterdayWordSearchAvoidBank(yesterdayData, difficulty)

    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`🤖 Generating AI WordSearch for ${today}...`)
        const aiTheme = await generateAIWordSearchTheme(difficulty)
        puzzleData = generateWordSearch(difficulty, aiTheme.words, today)
        title = `Daily Word Search: ${aiTheme.theme} - ${today}`
        console.log('✅ AI WordSearch generated')
      } catch (e) {
        console.error('❌ AI WordSearch failed, falling back:', e)
        puzzleData = generateWordSearch(difficulty, undefined, today, avoidBankIndex)
        title = `Daily Word Search - ${today}`
      }
    } else {
      console.warn('⚠️ GROQ_API_KEY missing, using seeded WordSearch bank')
      puzzleData = generateWordSearch(difficulty, undefined, today, avoidBankIndex)
      title = `Daily Word Search - ${today}`
    }
  } else if (type === 'logic') {
    const yesterdayData = await getYesterdayPuzzleData('logic', today)
    const avoidQuestion = yesterdayData?.question

    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`🤖 Generating AI Logic Puzzle for ${today}...`)
        puzzleData = await generateAILogicPuzzle(difficulty)
        title = `Daily Riddle - ${today}`
        console.log('✅ AI Logic Puzzle generated')
      } catch (e) {
        console.error('❌ AI Logic failed, falling back:', e)
        puzzleData = generateLogicPuzzle(difficulty, today, avoidQuestion)
        title = `Daily Riddle - ${today}`
      }
    } else {
      console.warn('⚠️ GROQ_API_KEY missing, using seeded Logic bank')
      puzzleData = generateLogicPuzzle(difficulty, today, avoidQuestion)
      title = `Daily Riddle - ${today}`
    }
  } else if (type === 'wordle') {
    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`🤖 Generating AI Word Guesser for ${today}...`)
        const aiWord = await generateAIWordGuesser(difficulty)
        const sanitizedWord = (aiWord.word || 'PUZZLE').trim().toUpperCase()
        puzzleData = { solution: sanitizedWord }
        title = `Daily Word Guesser: ${aiWord.theme_hint || '5-Letter Word'} - ${today}`
        console.log('✅ AI Word Guesser generated')
      } catch (e) {
        console.error('❌ AI Word Guesser failed, falling back:', e)
        puzzleData = { solution: 'PUZZLE' }
        title = `Daily Word Guesser - ${today}`
      }
    } else {
      puzzleData = { solution: 'PUZZLE' }
      title = `Daily Word Guesser - ${today}`
    }
  } else if (type === 'jigsaw') {
    const imageIndex = getLogicPuzzleBankIndex('easy', today) % JIGSAW_IMAGES.length
    const imageUrl = JIGSAW_IMAGES[imageIndex]
    puzzleData = { image_url: imageUrl, pieces: 24 }
    title = `Daily Jigsaw - ${today}`
  }

  return { puzzleData, solutionData, title }
}

export async function ensureDailyPuzzleForType(type: PuzzleType, today = getTodayDateEastern()) {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('puzzles')
    .select('*')
    .eq('is_daily', true)
    .eq('daily_date', today)
    .eq('type', type)
    .maybeSingle()

  if (existing) return { puzzle: existing, created: false }

  const { puzzleData, solutionData, title } = await buildDailyPuzzleData(type, today)

  const newPuzzle = {
    id: uuidv4(),
    title,
    type,
    difficulty: 'medium',
    puzzle_data: puzzleData,
    solution_data: solutionData,
    is_daily: true,
    daily_date: today,
    play_count: 0
  }

  const { data, error } = await supabase
    .from('puzzles')
    .insert(newPuzzle)
    .select()
    .single()

  if (error) {
    const { data: retry } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('daily_date', today)
      .eq('type', type)
      .maybeSingle()
    if (retry) return { puzzle: retry, created: false }
    throw new Error(error.message)
  }

  return { puzzle: data, created: true }
}

export async function generateAndStoreDailyPuzzles() {
  const today = getTodayDateEastern()
  const types: PuzzleType[] = ['sudoku', 'wordsearch', 'logic', 'wordle', 'jigsaw']
  const results = []

  for (const type of types) {
    try {
      const { puzzle, created } = await ensureDailyPuzzleForType(type, today)
      results.push({
        type,
        status: created ? 'created' : 'already_exists',
        id: puzzle.id
      })
    } catch (err: any) {
      console.error(`Unexpected error in daily ${type}:`, err.message)
      results.push({ type, status: 'error', error: err.message })
    }
  }

  return results
}
