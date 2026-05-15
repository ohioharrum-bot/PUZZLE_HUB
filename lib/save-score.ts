'use server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { headers } from 'next/headers'

export async function saveScore(puzzleId: string, timeSeconds: number) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()

  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'

  const { error } = await supabase.from('scores').insert({
    puzzle_id: puzzleId,
    user_id: session?.user?.id ?? null,
    session_id: session?.user?.id ?? ip, // fallback to IP for guests
    ip_address: ip,
    time_seconds: timeSeconds,
    completed: true,
  })

  if (error) console.error('[saveScore] error:', error.message)

  return { error }
}