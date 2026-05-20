'use client'
import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'

interface LocalSolve {
  solvedAt: string
  seconds: number
}

export default function GuestProgress() {
  const [stats, setStats] = useState({
    totalSolved: 0,
    bestTime: null as number | null,
    streak: '0 days'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = () => {
      const solves: LocalSolve[] = []
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('puzzle-completed-')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}')
              if (data.solvedAt && data.seconds !== undefined) {
                solves.push(data)
              }
            } catch (e) {
              console.error('Failed to parse local solve data', e)
            }
          }
        }
      }

      const totalSolved = solves.length
      const bestTime = solves.length ? Math.min(...solves.map(s => s.seconds)) : null
      
      // Calculate streak
      const dates = [...new Set(solves.map(s => 
        new Date(s.solvedAt).toDateString()
      ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      let streak = 0
      if (dates.length > 0) {
        streak = 1
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        
        // If the latest solve is not today or yesterday, streak is broken
        if (dates[0] !== today && dates[0] !== yesterday) {
          streak = 0
        } else {
          for (let i = 1; i < dates.length; i++) {
            const diff = (new Date(dates[i-1]).getTime() - new Date(dates[i]).getTime()) / 86400000
            if (diff <= 1.5) streak++
            else break
          }
        }
      }

      setStats({
        totalSolved,
        bestTime,
        streak: `${streak} day${streak !== 1 ? 's' : ''}`
      })
      setLoading(false)
    }

    loadStats()
  }, [])

  if (loading) return null

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="motion-item rounded-[30px] border border-black/10 bg-white/65 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">Guest Profile</p>
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[9px] font-medium text-black/40">Local Storage Only</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Guest Player</h1>
        <p className="mt-1 text-xs text-black/45">Your progress is saved locally on this browser.</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Puzzles Solved', value: String(stats.totalSolved) },
            { label: 'Best Time', value: stats.bestTime ? formatTime(stats.bestTime) : '—' },
            { label: 'Streak', value: stats.streak },
          ].map(m => (
            <div key={m.label} className="rounded-2xl border border-black/8 bg-white/60 px-4 py-4">
              <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
              <p className="mt-0.5 text-xs text-black/40">{m.label}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 rounded-2xl bg-black/5 p-4">
          <p className="text-xs leading-relaxed text-black/50">
            <strong>Note:</strong> Guest progress isn&apos;t synced across devices. 
            <a href="/auth/login" className="ml-1 font-semibold text-black hover:underline">Sign in</a> to sync your scores and join the global leaderboards.
          </p>
        </div>
      </section>
    </div>
  )
}
