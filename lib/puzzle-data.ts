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
  const { data, error } = await supabase.from('puzzles').select('*').eq('id', id).single()

  if (error || !data) return null
  if (type && data.type !== type) return null

  return data as Puzzle
}
