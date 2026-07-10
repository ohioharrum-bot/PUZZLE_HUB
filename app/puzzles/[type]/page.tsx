import AdBanner from '@/components/AdBanner'
import PuzzleCard from '@/components/PuzzleCard'
import { getPuzzles } from '@/lib/puzzle-data'
import type { Puzzle, PuzzleType } from '@/types/puzzle'
import { notFound } from 'next/navigation'

const PUZZLE_TYPES: Record<string, { title: string; description: string }> = {
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
  'word-guesser': {
    title: 'Word Guesser',
    description: 'Guess the hidden 5-letter word in six tries.',
  },
  'wordle': {
    title: 'Word Guesser',
    description: 'Guess the hidden 5-letter word in six tries.',
  },
  'crossword': {
    title: 'Crossword',
    description: 'Solve crossword puzzles with clever clues.',
  },
}

export const revalidate = 60

export default async function PuzzleTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const mappedType = type === 'word-guesser' ? 'wordle' : type

  if (!isPuzzleType(type)) notFound()

  const puzzles = await getPuzzles({ type: mappedType as PuzzleType })
  const meta = PUZZLE_TYPES[type]

  // Filter out daily puzzles from category page list
  const nonDailyPuzzles = puzzles.filter(p => !p.is_daily)

  return (
    <main className="main">
      <div className="section-header">
        <span className="section-title">Puzzle Collection</span>
      </div>

      <div className="featured-row" style={{ marginBottom: 40 }}>
        <div className="featured-card blue" style={{ cursor: 'default' }}>
          <div>
            <div className="featured-label">{meta.title} Puzzles</div>
            <div className="featured-title" style={{ maxWidth: '600px' }}>{meta.description}</div>
          </div>
          <div>
            <div className="featured-meta">{nonDailyPuzzles.length} puzzles available</div>
          </div>
        </div>
      </div>

      <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP!} format="horizontal" />

      <div className="section-header" style={{ marginTop: 24 }}>
        <span className="section-title">All {meta.title} Puzzles</span>
      </div>

      {nonDailyPuzzles.length ? (
        <div className="puzzle-grid">
          {nonDailyPuzzles.map((puzzle: Puzzle) => (
            <PuzzleCard key={puzzle.id} puzzle={puzzle} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          color: 'var(--gray-600)',
          fontSize: '14px'
        }}>
          No {meta.title.toLowerCase()} puzzles have been added yet.
        </div>
      )}

      <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM!} format="rectangle" />
    </main>
  )
}

function isPuzzleType(type: string): boolean {
  return type in PUZZLE_TYPES
}
