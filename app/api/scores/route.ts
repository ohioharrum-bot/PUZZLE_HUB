import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

function normalizeIp(ip: string | null): string {
  if (!ip) return '127.0.0.1'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1'
  return ip
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { puzzle_id, time_seconds } = await req.json()
    
    const headerList = await headers()
    const rawIp = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const ip = normalizeIp(rawIp)

    const { data: { user } } = await supabase.auth.getUser()

    console.log('📝 API: Submitting score...', { puzzle_id, time_seconds, user_id: user?.id, ip })

    const { data, error } = await supabase.from('scores').insert({
      puzzle_id,
      time_seconds,
      user_id: user?.id || null,
      ip_address: ip,
      completed: true
    }).select().single()

    if (error) {
      console.error('❌ API: Error inserting score:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('🔥 API: Critical error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const puzzle_id = searchParams.get('puzzle_id')
  const ip_param = searchParams.get('ip')
  const user_id_param = searchParams.get('user_id')
  const mine = searchParams.get('mine') === 'true'
  
  const supabase = await createServerSupabaseClient()
  const headerList = await headers()
  const rawIp = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const currentIp = normalizeIp(rawIp)
  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('scores')
    .select('*, puzzles(*), profiles(username)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (puzzle_id) {
    query = query.eq('puzzle_id', puzzle_id).order('time_seconds', { ascending: true })
  }
  
  if (user_id_param) {
    query = query.eq('user_id', user_id_param)
  } else if (ip_param) {
    query = query.eq('ip_address', normalizeIp(ip_param))
  } else if (mine) {
    if (user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('ip_address', currentIp).is('user_id', null)
    }
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
