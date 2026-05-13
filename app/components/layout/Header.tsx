import Link from 'next/link'
import { Brain, Hash, Puzzle, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#eef0f2]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-black">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <Brain className="h-4 w-4" />
          </span>
          PuzzleHub
        </Link>
        <nav className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/55 p-1 text-xs font-medium text-black/65 shadow-sm md:flex">
          <Link href="/puzzles/sudoku" className="flex items-center gap-1 rounded-full px-3 py-2 transition hover:bg-black hover:text-white">
            <Hash className="w-4 h-4" /> Sudoku
          </Link>
          <Link href="/puzzles/wordsearch" className="flex items-center gap-1 rounded-full px-3 py-2 transition hover:bg-black hover:text-white">
            <Search className="w-4 h-4" /> Word Search
          </Link>
          <Link href="/puzzles/jigsaw" className="flex items-center gap-1 rounded-full px-3 py-2 transition hover:bg-black hover:text-white">
            <Puzzle className="w-4 h-4" /> Jigsaw
          </Link>
          <Link href="/puzzles/logic" className="flex items-center gap-1 rounded-full px-3 py-2 transition hover:bg-black hover:text-white">
            <Brain className="w-4 h-4" /> Logic
          </Link>
        </nav>
      </div>
    </header>
  )
}
