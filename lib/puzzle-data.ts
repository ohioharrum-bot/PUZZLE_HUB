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

  return (data ?? []) as Puzzle[]
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

    if (todayPuzzle) return todayPuzzle as Puzzle

    // Fallback: Get the most recent daily puzzle of this type
    const { data: latestDaily } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('type', type || 'sudoku')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return latestDaily as Puzzle | null
  }

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  if (type && data.type !== type) return null

  return data as Puzzle
}
