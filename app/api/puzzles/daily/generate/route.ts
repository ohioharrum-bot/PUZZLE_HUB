import { generateAndStoreDailyPuzzles } from '@/lib/daily-generator'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  console.log('📬 Daily generation request received')
  
  // 1. Verify Auth (Cron Secret)
  const authHeader = req.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('⚠️ CRON_SECRET is not set in environment variables')
  }

  const isCron = authHeader === `Bearer ${cronSecret}`
  
  // Also allow admin secret for manual testing
  const adminSecret = req.headers.get('x-admin-secret')
  const internalAdminSecret = process.env.ADMIN_SECRET
  const isAdmin = adminSecret === internalAdminSecret && internalAdminSecret !== undefined

  if (!isCron && !isAdmin) {
    console.error('❌ Unauthorized daily generation attempt')
    return NextResponse.json({ 
      error: 'Unauthorized', 
      details: !cronSecret ? 'CRON_SECRET missing on server' : 'Secret mismatch' 
    }, { status: 401 })
  }

  try {
    console.log('🎲 Starting daily puzzle generation...')
    const results = await generateAndStoreDailyPuzzles()
    console.log('✅ Daily puzzle generation complete:', JSON.stringify(results))
    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('❌ Daily generation failed:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Support POST for Vercel Cron
export async function POST(req: Request) {
    return GET(req);
}
