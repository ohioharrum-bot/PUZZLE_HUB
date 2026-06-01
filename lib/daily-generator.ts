import { v4 as uuidv4 } from 'uuid'
import { generateSudoku, generateWordSearch, generateLogicPuzzle } from './puzzle-generators'
import { generateAILogicPuzzle, generateAIWordSearchTheme } from './ai-generator'
import { createAdminClient } from './supabase-admin'
import type { PuzzleType } from '@/types/puzzle'

export async function generateAndStoreDailyPuzzles() {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const types: PuzzleType[] = ['sudoku', 'wordsearch', 'logic']
  const results = []

  for (const type of types) {
    // Check if daily already exists for today to avoid duplicates
    const { data: existing } = await supabase
      .from('puzzles')
      .select('id')
      .eq('is_daily', true)
      .eq('daily_date', today)
      .eq('type', type)
      .maybeSingle()

    if (existing) {
      results.push({ type, status: 'already_exists', id: existing.id })
      continue
    }

    let puzzleData: any
    let solutionData: any = null
    let title = `Daily ${type.charAt(0).toUpperCase() + type.slice(1)} - ${today}`

    try {
      if (type === 'sudoku') {
        const { puzzle, solution } = generateSudoku('medium')
        puzzleData = puzzle
        solutionData = { solution }
      } else if (type === 'wordsearch') {
        if (process.env.GROQ_API_KEY) {
          try {
            console.log(`🤖 Generating AI WordSearch for ${today}...`)
            const aiTheme = await generateAIWordSearchTheme('medium')
            puzzleData = generateWordSearch('medium', aiTheme.words)
            title = `Daily Word Search: ${aiTheme.theme} - ${today}`
            console.log('✅ AI WordSearch generated')
          } catch (e) {
            console.error('❌ AI WordSearch failed, falling back:', e)
            puzzleData = generateWordSearch('medium')
          }
        } else {
          console.warn('⚠️ GROQ_API_KEY missing, using local WordSearch bank')
          puzzleData = generateWordSearch('medium')
        }
      } else if (type === 'logic') {
        if (process.env.GROQ_API_KEY) {
          try {
            console.log(`🤖 Generating AI Logic Puzzle for ${today}...`)
            puzzleData = await generateAILogicPuzzle('medium')
            title = `Daily Riddle - ${today}`
            console.log('✅ AI Logic Puzzle generated')
          } catch (e) {
            console.error('❌ AI Logic failed, falling back:', e)
            puzzleData = generateLogicPuzzle('medium')
          }
        } else {
          console.warn('⚠️ GROQ_API_KEY missing, using local Logic bank')
          puzzleData = generateLogicPuzzle('medium')
        }
      }

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
        console.error(`Error creating daily ${type}:`, error.message)
        results.push({ type, status: 'error', error: error.message })
      } else {
        results.push({ type, status: 'created', id: data.id })
      }
    } catch (err: any) {
      console.error(`Unexpected error in daily ${type}:`, err.message)
      results.push({ type, status: 'error', error: err.message })
    }
  }

  return results
}

