'use client'
import { useState, useEffect, useCallback } from 'react'
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

  const loadStats = useCallback(() => {
    const solves: LocalSolve[] = []
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('puzzle-completed-')) {
          try {
            const item = localStorage.getItem(key)
            if (item) {
              const data = JSON.parse(item)
              if (data.solvedAt && data.seconds !== undefined) {
                solves.push(data)
              }
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
      
      // If the latest solve is not today or yesterday, streak might be broken
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
  }, [])

  useEffect(() => {
    loadStats()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('puzzle-completed-')) {
        loadStats()
      }
    }

    // Listen for live updates from this tab
    window.addEventListener('puzzle-solved', loadStats)
    
    // Listen for updates from other tabs
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('puzzle-solved', loadStats)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadStats])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="motion-item rounded-[24px] border border-[#e2e2e2] bg-[#ffffff] p-6 shadow-sm shadow-black/5 animate-pulse">
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 w-24 bg-[#f0f0f0] rounded" />
            <div className="h-4 w-28 bg-[#f0f0f0] rounded-full" />
          </div>
          <div className="h-8 w-40 bg-[#f0f0f0] rounded mt-1" />
          <div className="h-3 w-56 bg-[#f0f0f0] rounded mt-2" />

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-[#eeeeee] bg-[#fafafa] px-4 py-4">
                <div className="h-8 w-16 bg-[#f0f0f0] rounded" />
                <div className="h-3 w-20 bg-[#f0f0f0] rounded mt-2" />
              </div>
            ))}
          </div>
          
          <div className="mt-6 rounded-2xl bg-[#f5f5f5] p-4 border border-[#eeeeee]">
            <div className="h-3 w-full bg-[#f0f0f0] rounded" />
            <div className="h-3 w-2/3 bg-[#f0f0f0] rounded mt-2" />
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="motion-item rounded-[24px] border border-[#e2e2e2] bg-[#ffffff] p-6 shadow-sm shadow-black/5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#888888]">Guest Profile</p>
          <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[9px] font-medium text-[#666666]">Local Storage Only</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Guest Player</h1>
        <p className="mt-1 text-xs text-[#666666]">Your progress is saved locally on this browser.</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Puzzles Solved', value: String(stats.totalSolved) },
            { label: 'Best Time', value: stats.bestTime ? formatTime(stats.bestTime) : '—' },
            { label: 'Streak', value: stats.streak },
          ].map(m => (
            <div key={m.label} className="rounded-2xl border border-[#eeeeee] bg-[#fafafa] px-4 py-4">
              <p className="text-2xl font-semibold tracking-tight text-[#111111]">{m.value}</p>
              <p className="mt-0.5 text-xs text-[#888888]">{m.label}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 rounded-2xl bg-[#f5f5f5] p-4 border border-[#eeeeee]">
          <p className="text-xs leading-relaxed text-[#666666]">
            <strong>Note:</strong> Guest progress isn&apos;t synced across devices. 
            <a href="/auth/login" className="ml-1 font-semibold text-[#111111] hover:underline">Sign in</a> to sync your scores and join the global leaderboards.
          </p>
        </div>
      </section>
    </div>
  )
}
