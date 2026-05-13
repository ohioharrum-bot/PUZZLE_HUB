import Link from 'next/link'
import { Brain, Grid3X3, Puzzle as PuzzleIcon, Search, Users } from 'lucide-react'
import { Puzzle } from '@/types/puzzle'

const DIFFICULTY_COLOR = {
  easy: 'bg-[#d7f4d7] text-[#1d5b2b]',
  medium: 'bg-[#fff2a8] text-[#685b12]',
  hard: 'bg-[#f2d6ff] text-[#5f2678]',
}

const TYPE_ICON = {
  sudoku: Grid3X3,
  wordsearch: Search,
  jigsaw: PuzzleIcon,
  logic: Brain,
}

export default function PuzzleCard({ puzzle }: { puzzle: Puzzle }) {
  const Icon = TYPE_ICON[puzzle.type]

  return (
    <Link href={`/puzzles/${puzzle.type}/${puzzle.id}`} className="group block h-full">
      <div className="h-full cursor-pointer rounded-[24px] border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/10">
        <div className="mb-5 flex items-start justify-between">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dff3ff] text-black ring-1 ring-black/5 transition group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </span>
          {puzzle.is_daily && (
            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              Daily
            </span>
          )}
        </div>
        <h3 className="mb-1 text-lg font-semibold leading-tight text-black">{puzzle.title}</h3>
        <p className="text-xs capitalize text-black/45">{puzzle.type.replace('wordsearch', 'word search')}</p>
        <div className="mt-5 flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${DIFFICULTY_COLOR[puzzle.difficulty]}`}>
            {puzzle.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-black/40">
            <Users className="h-3 w-3" /> {puzzle.play_count}
          </span>
        </div>
      </div>
    </Link>
  )
}
