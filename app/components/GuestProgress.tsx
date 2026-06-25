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
      <main className="main">
        <div className="section-header">
          <span className="section-title">Account</span>
        </div>
        <div style={{
          background: 'var(--white)',
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'pulse 1.5s infinite'
        }}>
          <div style={{ height: '24px', width: '200px', background: 'var(--gray-100)', borderRadius: '4px' }} />
          <div style={{ height: '40px', width: '300px', background: 'var(--gray-100)', borderRadius: '4px' }} />
          <div style={{ height: '80px', background: 'var(--gray-100)', borderRadius: '8px' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="section-header">
        <span className="section-title">Account</span>
      </div>

      {/* Guest Summary Card */}
      <div className="featured-row" style={{ marginBottom: 40 }}>
        <div className="featured-card dark" style={{ cursor: 'default' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
              <div className="featured-label" style={{ margin: 0 }}>Guest Profile</div>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'var(--white)',
                padding: '2px 8px',
                borderRadius: '100px',
                fontSize: '9px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                Local Storage Only
              </span>
            </div>
            <div className="featured-title">Guest Player</div>
          </div>
          <div>
            <div className="featured-meta">Your progress is saved locally on this browser.</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-bar" style={{ marginBottom: 40 }}>
        <div className="stat-item">
          <div className="stat-number">{stats.totalSolved}</div>
          <div className="stat-label">Puzzles Solved</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.bestTime ? formatTime(stats.bestTime) : '—'}</div>
          <div className="stat-label">Best Time</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.streak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>
      
      {/* Sync Callout */}
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px'
      }}>
        <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', margin: 0 }}>
          Guest progress is stored in your current browser and isn&apos;t synced across other devices. 
          Create a free account to back up your progress, track your stats permanently, and join the global leaderboards.
        </p>
        <a href="/auth/login" className="btn-primary" style={{ textDecoration: 'none' }}>
          Sign Up / Log In
        </a>
      </div>
    </main>
  )
}
