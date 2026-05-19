import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<unknown> }) {
  const { id } = await params as { id: string }
  const supabase = await createServerSupabaseClient()
  
  let query = supabase.from('puzzles').select('*')
  
  if (id === 'daily') {
    const today = new Date().toISOString().split('T')[0]
    query = query.eq('is_daily', true).eq('daily_date', today)
  } else {
    query = query.eq('id', id)
  }

  const { data, error } = await query.maybeSingle()
  
  if (error || !data) {
    if (id === 'daily') {
      // Fallback for daily
      const { data: latest } = await supabase
        .from('puzzles')
        .select('*')
        .eq('is_daily', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (latest) return NextResponse.json(latest)
    }
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }

  // Increment play count
  await supabase.rpc('increment_play_count', { puzzle_id: data.id })

  return NextResponse.json(data)
}
