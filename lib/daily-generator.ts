import { v4 as uuidv4 } from 'uuid'
import {
  generateSudoku,
  generateWordSearch,
  generateLogicPuzzle,
  LOGIC_PUZZLE_POOLS,
  WORD_BANKS,
  JIGSAW_IMAGES,
  generateJigsaw
} from './puzzle-generators'
import { generateAILogicPuzzle, generateAIWordSearchTheme, generateAIWordGuesser } from './ai-generator'
import { createAdminClient } from './supabase-admin'
import { getTodayDateEastern, pickDailyIndex } from './daily-seed'
import type { PuzzleType } from '@/types/puzzle'

const WORDLE_FALLBACK_WORDS = [
  "CLOCK", "PLANT", "LIGHT", "WATER", "HOUSE", "PLANE", "SHARK", "TRAIN", "SMILE", "STONE",
  "FLAME", "SWEET", "DREAM", "HEART", "CLOUD", "BREAD", "NIGHT", "GREEN", "PAPER", "SOUND",
  "WORLD", "MUSIC", "FRUIT", "WHITE", "BLACK", "GLASS", "BOARD", "CHAIR", "STORM", "MIGHT",
  "FLOOR", "PHONE", "SHINE", "SHIRT", "TABLE", "MOUTH", "EARTH", "LUNCH", "CHIPS", "BEACH",
  "WHEAT", "GRAPE", "CHAMP", "SMART", "BRAVE", "PIXEL", "SPACE", "BRUSH", "FLUTE", "BRICK"
]

async function getRecentDailyPuzzleData(type: PuzzleType, today: string, count = 10): Promise<any[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('puzzles')
    .select('puzzle_data')
    .eq('type', type)
    .eq('is_daily', true)
    .lt('daily_date', today)
    .order('daily_date', { ascending: false })
    .limit(count)
  return data ? data.map(p => p.puzzle_data) : []
}

function formatDateFriendly(dateString: string): string {
  const parts = dateString.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return dateString
  const [year, month, day] = parts
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const monthName = months[month - 1] || ''
  
  let suffix = 'th'
  if (day < 11 || day > 13) {
    switch (day % 10) {
      case 1: suffix = 'st'; break;
      case 2: suffix = 'nd'; break;
      case 3: suffix = 'rd'; break;
    }
  }
  return `${monthName} ${day}${suffix}, ${year}`
}

async function buildDailyPuzzleData(type: PuzzleType, today: string) {
  const difficulty = 'medium' as const
  let puzzleData: any
  let solutionData: any = null
  const dateFriendly = formatDateFriendly(today)
  let title = `Daily ${type === 'wordle' ? 'Word Guesser' : type.replace('-', ' ').charAt(0).toUpperCase() + type.replace('-', ' ').slice(1)} - ${dateFriendly}`

  if (type === 'sudoku') {
    const { puzzle, solution } = generateSudoku(difficulty)
    puzzleData = puzzle
    solutionData = { solution }
  } else if (type === 'wordsearch') {
    const recentData = await getRecentDailyPuzzleData('wordsearch', today, 10)
    const avoidWordsList = recentData.map(d => d.words ?? [])
    const banks = WORD_BANKS[difficulty]
    
    // Find a bank that doesn't share words with recently used word searches
    let chosenBankIndex = -1
    for (let i = 0; i < banks.length; i++) {
      const bank = banks[i]
      const overlaps = avoidWordsList.some(words => words.some((w: string) => bank.includes(w)))
      if (!overlaps) {
        chosenBankIndex = i
        break
      }
    }
    if (chosenBankIndex === -1) {
      chosenBankIndex = Math.floor(Math.random() * banks.length)
    }

    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`🤖 Generating AI WordSearch for ${today}...`)
        const aiTheme = await generateAIWordSearchTheme(difficulty)
        puzzleData = generateWordSearch(difficulty, aiTheme.words, today)
        title = `Daily Word Search: ${aiTheme.theme} - ${dateFriendly}`
        console.log('✅ AI WordSearch generated')
      } catch (e) {
        console.error('❌ AI WordSearch failed, falling back:', e)
        puzzleData = generateWordSearch(difficulty, undefined, today, chosenBankIndex)
        title = `Daily Word Search - ${dateFriendly}`
      }
    } else {
      console.warn('⚠️ GROQ_API_KEY missing, using seeded WordSearch bank')
      puzzleData = generateWordSearch(difficulty, undefined, today, chosenBankIndex)
      title = `Daily Word Search - ${dateFriendly}`
    }
  } else if (type === 'logic') {
    const recentData = await getRecentDailyPuzzleData('logic', today, 10)
    const recentQuestions = recentData.map(d => d.question)
    const pool = LOGIC_PUZZLE_POOLS[difficulty]
    
    // Find a question not recently used
    const available = pool.filter(p => !recentQuestions.includes(p.question))
    const selectedQuestion = available.length > 0 
      ? available[Math.floor(Math.random() * available.length)] 
      : pool[Math.floor(Math.random() * pool.length)]

    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`🤖 Generating AI Logic Puzzle for ${today}...`)
        puzzleData = await generateAILogicPuzzle(difficulty)
        title = `Daily Riddle - ${dateFriendly}`
        console.log('✅ AI Logic Puzzle generated')
      } catch (e) {
        console.error('❌ AI Logic failed, falling back:', e)
        puzzleData = selectedQuestion
        title = `Daily Riddle - ${dateFriendly}`
      }
    } else {
      puzzleData = selectedQuestion
      title = `Daily Riddle - ${dateFriendly}`
    }
  } else if (type === 'wordle') {
    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`🤖 Generating AI Word Guesser for ${today}...`)
        const aiWord = await generateAIWordGuesser(difficulty)
        const sanitizedWord = (aiWord.word || 'PUZZLE').trim().toUpperCase()
        puzzleData = { solution: sanitizedWord }
        title = `Daily Word Guesser: ${aiWord.theme_hint || '5-Letter Word'} - ${dateFriendly}`
        console.log('✅ AI Word Guesser generated')
      } catch (e) {
        console.error('❌ AI Word Guesser failed, falling back:', e)
        const wordIndex = pickDailyIndex(WORDLE_FALLBACK_WORDS.length, today)
        const fallbackWord = WORDLE_FALLBACK_WORDS[wordIndex]
        puzzleData = { solution: fallbackWord }
        title = `Daily Word Guesser - ${dateFriendly}`
      }
    } else {
      const wordIndex = pickDailyIndex(WORDLE_FALLBACK_WORDS.length, today)
      const fallbackWord = WORDLE_FALLBACK_WORDS[wordIndex]
      puzzleData = { solution: fallbackWord }
      title = `Daily Word Guesser - ${dateFriendly}`
    }
  } else if (type === 'jigsaw') {
    const recentData = await getRecentDailyPuzzleData('jigsaw', today, 10)
    const recentUrls = recentData.map(d => d.image_url)
    const available = JIGSAW_IMAGES.filter(url => !recentUrls.includes(url))
    const chosenUrl = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : JIGSAW_IMAGES[Math.floor(Math.random() * JIGSAW_IMAGES.length)]
    
    const imageIndex = JIGSAW_IMAGES.indexOf(chosenUrl)
    const pieces = [16, 24, 48][imageIndex % 3]
    puzzleData = { image_url: chosenUrl, pieces }
    title = `Daily Jigsaw - ${dateFriendly}`
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
    content: puzzleData,
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
