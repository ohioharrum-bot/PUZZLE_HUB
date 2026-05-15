import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Trophy } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  display_name: string
  is_anonymous: boolean
  time_seconds: number
}

export default async function Leaderboard({ puzzleId }: { puzzleId: string }) {
  const supabase = await createServerSupabaseClient()

  const { data: entriesRaw } = await supabase
    .rpc('get_leaderboard', { p_puzzle_id: puzzleId })
  
  const entries = (entriesRaw as unknown as LeaderboardEntry[]) || []

  return (
    <div className="rounded-[28px] border border-black/10 bg-white/65 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <h2 className="text-sm font-semibold text-black/70">Leaderboard</h2>
      </div>

      {!entries.length ? (
        <p className="text-center text-xs text-black/35 py-6">No solves yet — be the first!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.rank}
              className="flex items-center gap-3 rounded-xl border border-black/6 bg-white/50 px-3 py-2.5">
              <span className="w-5 text-center text-xs font-bold text-black/40">
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </span>
              <span className="flex-1 truncate text-xs font-medium text-black/75">
                {entry.display_name}
                {entry.is_anonymous && (
                  <span className="ml-1 text-[10px] text-black/30">(guest)</span>
                )}
              </span>
              <span className="font-mono text-xs font-semibold text-black/60">
                {formatTime(entry.time_seconds)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}