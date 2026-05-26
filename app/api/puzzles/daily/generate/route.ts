import { generateAndStoreDailyPuzzles } from '@/lib/daily-generator'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // 1. Verify Auth (Cron Secret)
  const authHeader = req.headers.get('Authorization')
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  
  // Also allow admin secret for manual testing
  const adminSecret = req.headers.get('x-admin-secret')
  const isAdmin = adminSecret === process.env.ADMIN_SECRET

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await generateAndStoreDailyPuzzles()
    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Support POST for Vercel Cron
export async function POST(req: Request) {
    return GET(req);
}
