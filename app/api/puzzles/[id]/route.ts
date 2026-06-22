import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ensureDailyPuzzleForType } from '@/lib/daily-generator'
import { getTodayDateEastern } from '@/lib/daily-seed'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  const { id } = await params as { id: string }
  const supabase = await createServerSupabaseClient()

  if (id === 'daily') {
    const today = getTodayDateEastern()
    const { data: todayPuzzle } = await supabase
      .from('puzzles')
      .select('*')
      .eq('is_daily', true)
      .eq('daily_date', today)
      .maybeSingle()

    let puzzle = todayPuzzle
    if (!puzzle) {
      try {
        const { puzzle: ensured } = await ensureDailyPuzzleForType('sudoku', today)
        puzzle = ensured
      } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    await supabase.rpc('increment_play_count', { puzzle_id: puzzle.id })
    return NextResponse.json(puzzle)
  }

  const { data, error } = await supabase
    .from('puzzles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }

  await supabase.rpc('increment_play_count', { puzzle_id: data.id })
  return NextResponse.json(data)
}
