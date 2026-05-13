import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  const { id } = await params as { id: string }
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('puzzles').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Increment play count
  await supabase.rpc('increment_play_count', { puzzle_id: id })

  return NextResponse.json(data)
}
