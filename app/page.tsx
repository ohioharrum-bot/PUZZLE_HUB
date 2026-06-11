import PuzzleCard from '@/components/PuzzleCard'
import AdBanner from '@/components/AdBanner'
import { Puzzle } from '@/types/puzzle'
import { getPuzzles } from '@/lib/puzzle-data'
import PageMotion from '@/components/PageMotion'
import AdSidebar from '@/components/AdSidebar'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const puzzles = await getPuzzles()

  const allDaily = puzzles.filter(p => p.is_daily)
  const latestDailyDate = allDaily[0]?.daily_date
  const daily = allDaily.filter(p => p.daily_date === latestDailyDate)
  
  const byType = (type: string) => puzzles.filter(p => p.type === type && !p.is_daily).slice(0, 4)

  return (
    <PageMotion>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="motion-item overflow-hidden rounded-[34px] border border-black/10 bg-white/60 shadow-sm backdrop-blur">
            <div className="border-b border-black/10 px-5 py-4">
              <div className="flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-black/35 md:justify-between">
                <span>Daily puzzle studio</span>
              </div>
            </div>
            <div className="flex flex-col items-center px-5 py-14 text-center md:px-12 md:py-20">
              <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-black sm:text-5xl md:text-6xl">
                Quiet puzzles for sharper everyday thinking
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-black/50 md:mt-6 md:text-lg">
                Play Sudoku, word search, logic, word guesser, and jigsaw puzzles from a focused dashboard built for quick sessions and calm problem solving.
              </p>
              <div className="mt-10 flex justify-center">
                <Link href="/puzzles/sudoku" className="rounded-full bg-black px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-black/20 transition hover:-translate-y-1 active:scale-95">
                  Start with Sudoku
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-black/10 divide-x divide-black/10">
              <Metric label="Types" value="5" />
              <Metric label="Daily" value={String(daily.length)} />
              <Metric label="Source" value="DB" />
            </div>
          </section>

          <div className="motion-item">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP!} format="horizontal" />
          </div>

          {daily.length > 0 && (
            <PuzzleSection title="Today&apos;s Puzzles" intro="Fresh picks ready for a short focused break." puzzles={daily} />
          )}

          <PuzzleSection title="Sudoku" intro="Number grids with clean constraints and instant play." puzzles={byType('sudoku')} />

          <div className="motion-item">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM!} format="rectangle" />
          </div>

          <PuzzleSection title="Word Search" intro="Scan for hidden words across compact letter boards." puzzles={byType('wordsearch')} />
          <PuzzleSection title="Logic Puzzles" intro="Small reasoning challenges with clear answer feedback." puzzles={byType('logic')} />
          <PuzzleSection title="Word Guesser" intro="Guess the hidden 5-letter word in six tries." puzzles={byType('wordle')} />
          <PuzzleSection title="Jigsaw" intro="Visual board puzzles with a minimal tile interface." puzzles={byType('jigsaw')} />

          <div className="motion-item">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM!} format="horizontal" />
          </div>
        </div>
        <AdSidebar />
      </div>
    </PageMotion>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-black/10 px-5 py-5 text-center border-r last:border-r-0 md:text-left">
      <p className="text-2xl font-semibold tracking-[-0.03em] text-black md:text-3xl">{value}</p>
      <p className="mt-1 text-[10px] text-black/40 uppercase tracking-widest">{label}</p>
    </div>
  )
}

function PuzzleSection({ title, intro, puzzles }: { title: string; intro: string; puzzles: Puzzle[] }) {
  if (!puzzles.length) return null
  return (
    <section className="motion-item">
      <div className="mb-6 flex flex-col items-center gap-2 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-black md:text-3xl">{title}</h2>
          <p className="mt-1 max-w-xl text-sm text-black/45">{intro}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {puzzles.map((p: Puzzle) => <PuzzleCard key={p.id} puzzle={p} />)}
      </div>
    </section>
  )
}
