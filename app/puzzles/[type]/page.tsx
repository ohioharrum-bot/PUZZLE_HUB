import AdBanner from '@/components/AdBanner'
import AdSidebar from '@/components/AdSidebar'
import PageMotion from '@/components/PageMotion'
import PuzzleCard from '@/components/PuzzleCard'
import { getPuzzles } from '@/lib/puzzle-data'
import type { Puzzle, PuzzleType } from '@/types/puzzle'
import { notFound } from 'next/navigation'

const PUZZLE_TYPES: Record<PuzzleType, { title: string; description: string }> = {
  sudoku: {
    title: 'Sudoku',
    description: 'Fill each row, column, and box with the numbers 1 through 9.',
  },
  wordsearch: {
    title: 'Word Search',
    description: 'Find hidden words across the grid in every direction.',
  },
  logic: {
    title: 'Logic Puzzles',
    description: 'Work through clues, patterns, and clever twists.',
  },
  jigsaw: {
    title: 'Jigsaw',
    description: 'Piece together image puzzles at your own pace.',
  },
  wordle: {
    title: 'Word Guesser',
    description: 'Guess the hidden 5-letter word in six tries.',
  },
}

export const revalidate = 60

export default async function PuzzleTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params

  if (!isPuzzleType(type)) notFound()

  const puzzles = await getPuzzles({ type })
  const meta = PUZZLE_TYPES[type]

  return (
    <PageMotion>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="motion-item rounded-[34px] border border-black/10 bg-white/60 px-5 py-10 shadow-sm backdrop-blur md:px-10 md:py-12">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/35">Puzzle collection</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-black md:text-6xl">
              {meta.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-black/50 md:text-base">{meta.description}</p>
          </section>

          <div className="motion-item">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP!} format="horizontal" />
          </div>

          {puzzles.length ? (
            <section className="motion-item grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {puzzles.map((puzzle: Puzzle) => (
                <PuzzleCard key={puzzle.id} puzzle={puzzle} />
              ))}
            </section>
          ) : (
            <div className="motion-item rounded-[24px] border border-black/10 bg-white/65 p-8 text-center text-sm text-black/45">
              No {meta.title.toLowerCase()} puzzles have been added yet.
            </div>
          )}

          <div className="motion-item">
            <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM!} format="horizontal" />
          </div>
        </div>
        <AdSidebar />
      </div>
    </PageMotion>
  )
}

function isPuzzleType(type: string): type is PuzzleType {
  return type in PUZZLE_TYPES
}
