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

  const daily = puzzles.filter(p => p.is_daily)
  const byType = (type: string) => puzzles.filter(p => p.type === type)

  return (
    <PageMotion>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="motion-item overflow-hidden rounded-[34px] border border-black/10 bg-white/60 shadow-sm backdrop-blur">
            <div className="border-b border-black/10 px-5 py-4">
              <div className="flex items-center justify-between text-xs text-black/45">
                <span>Daily puzzle studio</span>
                <span>Updated from Supabase</span>
              </div>
            </div>
            <div className="px-5 py-12 text-center md:px-12 md:py-16">
              <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-black md:text-6xl">
                Quiet puzzles for sharper everyday thinking
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-black/50 md:text-base">
                Play Sudoku, word search, logic, and jigsaw puzzles from a focused dashboard built for quick sessions and calm problem solving.
              </p>
              <div className="mt-7 flex justify-center">
                <Link href="/puzzles/sudoku" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5">
                  Start with Sudoku
                </Link>
              </div>
            </div>
            <div className="grid border-t border-black/10 md:grid-cols-3">
              <Metric label="Puzzle types" value="4" />
              <Metric label="Daily picks" value={String(daily.length)} />
              <Metric label="Live source" value="DB" />
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
    <div className="border-black/10 px-5 py-5 text-left md:border-r last:md:border-r-0">
      <p className="text-3xl font-semibold tracking-[-0.03em] text-black">{value}</p>
      <p className="mt-1 text-xs text-black/40">{label}</p>
    </div>
  )
}

function PuzzleSection({ title, intro, puzzles }: { title: string; intro: string; puzzles: Puzzle[] }) {
  if (!puzzles.length) return null
  return (
    <section className="motion-item">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-black">{title}</h2>
          <p className="mt-1 max-w-xl text-sm text-black/45">{intro}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {puzzles.map((p: Puzzle) => <PuzzleCard key={p.id} puzzle={p} />)}
      </div>
    </section>
  )
}
