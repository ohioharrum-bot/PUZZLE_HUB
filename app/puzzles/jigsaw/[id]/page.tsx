import AdBanner from '@/components/AdBanner'
import PageMotion from '@/components/PageMotion'
import JigsawGame from '@/components/puzzles/JigsawGame'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound } from 'next/navigation'

export default async function JigsawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'jigsaw')

  if (!puzzle) notFound()

  return (
    <PageMotion>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="motion-item">
          <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP!} format="horizontal" />
        </div>
        <section className="motion-item rounded-[30px] border border-black/10 bg-white/65 p-5 shadow-sm backdrop-blur md:p-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">Jigsaw</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-black md:text-5xl">{puzzle.title}</h1>
        </section>
        <div className="motion-item">
          <JigsawGame puzzle={puzzle} />
        </div>
        <div className="motion-item">
          <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM!} format="rectangle" />
        </div>
      </div>
    </PageMotion>
  )
}
