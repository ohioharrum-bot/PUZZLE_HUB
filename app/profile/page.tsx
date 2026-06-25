import { createServerSupabaseClient } from '@/lib/supabase-server'
import { formatTime } from '@/lib/utils'
import { Score } from '@/types/puzzle'
import GuestProgress from '@/components/GuestProgress'

interface ScoreWithPuzzle extends Score {
  puzzles: {
    title: string
    type: string
    difficulty: string
  } | null
}

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return <GuestProgress />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: scoresRaw } = await supabase
    .from('scores')
    .select(`*, puzzles(title, type, difficulty)`)
    .eq('user_id', session.user.id)
    .eq('completed', true)
    .order('created_at', { ascending: false })

  const scores = (scoresRaw as unknown as ScoreWithPuzzle[]) || []

  const totalSolved = scores.length
  const bestTime = scores.length
    ? Math.min(...scores.map((s) => s.time_seconds))
    : null

  const byType = (type: string) => scores.filter((s) => s.puzzles?.type === type).length

  return (
    <main className="main">
      <div className="section-header">
        <span className="section-title">Account</span>
      </div>

      {/* Profile summary card */}
      <div className="featured-row" style={{ marginBottom: 40 }}>
        <div className="featured-card dark" style={{ cursor: 'default' }}>
          <div>
            <div className="featured-label">Your Profile</div>
            <div className="featured-title">{profile?.username ?? session.user.email}</div>
          </div>
          <div>
            <div className="featured-meta">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-bar" style={{ marginBottom: 40 }}>
        <div className="stat-item">
          <div className="stat-number">{totalSolved}</div>
          <div className="stat-label">Puzzles Solved</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{bestTime ? formatTime(bestTime) : '—'}</div>
          <div className="stat-label">Best Time</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{getStreak(scores)}</div>
          <div className="stat-label">Current Streak</div>
        </div>
      </div>

      {/* Solved by Category */}
      <div className="section-header">
        <span className="section-title">Solved by Category</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ marginBottom: 40 }}>
        {[
          { label: 'Sudoku', count: byType('sudoku') },
          { label: 'Word Search', count: byType('wordsearch') },
          { label: 'Logic Puzzles', count: byType('logic') },
          { label: 'Jigsaw', count: byType('jigsaw') },
        ].map(t => (
          <div key={t.label} style={{
            background: 'var(--white)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '32px', fontWeight: '800', color: 'var(--black)', margin: '0 0 4px 0' }}>{t.count}</p>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--gray-600)', margin: 0, letterSpacing: '0.5px' }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Recent solves */}
      {!!scores.length && (
        <>
          <div className="section-header">
            <span className="section-title">Recent Solves</span>
          </div>
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {scores.slice(0, 15).map((s) => (
              <div key={s.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gray-100)',
                fontSize: '14px'
              }}>
                <div>
                  <p style={{ fontWeight: '750', color: 'var(--black)', margin: '0 0 4px 0' }}>{s.puzzles?.title ?? 'Puzzle'}</p>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', textTransform: 'capitalize', margin: 0 }}>
                    {s.puzzles?.type === 'wordle' ? 'Word Guesser' : s.puzzles?.type} · {s.puzzles?.difficulty}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--black)', margin: '0 0 4px 0' }}>{formatTime(s.time_seconds)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0 }}>{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}

function getStreak(scores: ScoreWithPuzzle[]): string {
  if (!scores.length) return '0 days'
  const dates = [...new Set(scores.map((s) =>
    new Date(s.created_at).toDateString()
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i-1]).getTime() - new Date(dates[i]).getTime()) / 86400000
    if (diff <= 1.5) streak++
    else break
  }
  return `${streak} day${streak !== 1 ? 's' : ''}`
}
