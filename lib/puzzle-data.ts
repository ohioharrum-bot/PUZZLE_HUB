import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Puzzle, PuzzleType } from '@/types/puzzle'

type PuzzleQuery = {
  type?: PuzzleType
  limit?: number
}

export async function getPuzzles({ type, limit }: PuzzleQuery = {}): Promise<Puzzle[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase.from('puzzles').select('*').order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const puzzles = (data ?? []) as Puzzle[]

  // Check which are completed by current user
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
    const today = new Date().toISOString().split('T')[0]
    // Try to find today's daily puzzle
    const { data: todayPuzzle } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('daily_date', today)
      .eq('type', type || 'sudoku')
      .maybeSingle()

    if (todayPuzzle) {
      const puzzle = todayPuzzle as Puzzle
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: score } = await supabase
          .from('scores')
          .select('id')
          .eq('puzzle_id', puzzle.id)
          .eq('user_id', user.id)
          .eq('completed', true)
          .maybeSingle()
        if (score) puzzle.completed = true
      }
      return puzzle
    }

    // Fallback: Get the most recent daily puzzle of this type
    const { data: latestDaily } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('type', type || 'sudoku')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestDaily) {
      const puzzle = latestDaily as Puzzle
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: score } = await supabase
          .from('scores')
          .select('id')
          .eq('puzzle_id', puzzle.id)
          .eq('user_id', user.id)
          .eq('completed', true)
          .maybeSingle()
        if (score) puzzle.completed = true
      }
      return puzzle
    }

    return null
  }

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  if (type && data.type !== type) return null

  const puzzle = data as Puzzle

  // Check if completed by current user
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: score } = await supabase
      .from('scores')
      .select('id')
      .eq('puzzle_id', puzzle.id)
      .eq('user_id', user.id)
      .eq('completed', true)
      .maybeSingle()
    
    if (score) puzzle.completed = true
  }

  return puzzle
}
