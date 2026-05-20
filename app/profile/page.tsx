import { createServerSupabaseClient } from '@/lib/supabase-server'
import { formatTime } from '@/lib/utils'
import PageMotion from '@/components/PageMotion'
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
    return (
      <PageMotion>
        <GuestProgress />
      </PageMotion>
    )
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
    <PageMotion>
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Profile card */}
        <section className="motion-item rounded-[30px] border border-black/10 bg-white/65 p-6 shadow-sm backdrop-blur">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">Your Profile</p>
          <h1 className="text-2xl font-semibold tracking-tight">{profile?.username ?? session.user.email}</h1>
          <p className="mt-1 text-xs text-black/45">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Puzzles Solved', value: String(totalSolved) },
              { label: 'Best Time', value: bestTime ? formatTime(bestTime) : '—' },
              { label: 'Streak', value: getStreak(scores) },
            ].map(m => (
              <div key={m.label} className="rounded-2xl border border-black/8 bg-white/60 px-4 py-4">
                <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
                <p className="mt-0.5 text-xs text-black/40">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Puzzle type breakdown */}
        <section className="motion-item rounded-[30px] border border-black/10 bg-white/65 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-4 text-sm font-semibold text-black/70">Solved by type</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Sudoku', count: byType('sudoku') },
              { label: 'Word Search', count: byType('wordsearch') },
              { label: 'Logic', count: byType('logic') },
              { label: 'Jigsaw', count: byType('jigsaw') },
            ].map(t => (
              <div key={t.label} className="rounded-2xl border border-black/15 bg-white px-3 py-5 text-center text-black shadow-sm">
                <p className="text-2xl font-bold">{t.count}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-black/50">{t.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent solves */}
        {!!scores.length && (
          <section className="motion-item rounded-[30px] border border-black/10 bg-white/65 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-4 text-sm font-semibold text-black/70">Recent solves</h2>
            <div className="space-y-2">
              {scores.slice(0, 15).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-black/6 bg-white/50 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{s.puzzles?.title ?? 'Puzzle'}</p>
                    <p className="text-xs text-black/40 capitalize">{s.puzzles?.type} · {s.puzzles?.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">{formatTime(s.time_seconds)}</p>
                    <p className="text-xs text-black/35">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageMotion>
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
