import { getPuzzles } from '@/lib/puzzle-data'
import { getTodayDateEastern } from '@/lib/daily-seed'
import { HomePuzzleExplorer } from '@/components/PuzzleCard'

export const revalidate = 60

export default async function HomePage() {
  const puzzles = await getPuzzles()
  const today = getTodayDateEastern()
  const daily = puzzles.filter(p => p.is_daily && p.daily_date === today)

  return <HomePuzzleExplorer puzzles={puzzles} daily={daily} today={today} />
}
