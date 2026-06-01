import AdBanner from '@/components/AdBanner'
import PageMotion from '@/components/PageMotion'
import WordleGame from '@/components/puzzles/WordleGame'
import Leaderboard from '@/components/Leaderboard'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function WordlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'wordle')

  if (!puzzle) notFound()

  return (
    <PageMotion>
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="motion-item">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP!} format="horizontal" />
          </div>
          <section className="motion-item rounded-[30px] border border-black/10 bg-white/65 p-5 shadow-sm backdrop-blur md:p-8">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">Wordle</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-black md:text-5xl">{puzzle.title}</h1>
          </section>
          <div className="motion-item rounded-[30px] border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur md:p-8">
            <WordleGame puzzle={puzzle} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="motion-item">
            <Suspense fallback={<div className="p-10 text-center animate-pulse text-black/20">Loading leaderboard...</div>}>
              <Leaderboard puzzleId={puzzle.id} />
            </Suspense>
          </div>
          <div className="motion-item">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM!} format="rectangle" />
          </div>
        </div>
      </div>
    </PageMotion>
  )
}
