'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Brain, Hash, Puzzle, Search, Menu, X } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/puzzles/sudoku', icon: Hash, label: 'Sudoku' },
    { href: '/puzzles/wordsearch', icon: Search, label: 'Word Search' },
    { href: '/puzzles/jigsaw', icon: Puzzle, label: 'Jigsaw' },
    { href: '/puzzles/logic', icon: Brain, label: 'Logic' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#eef0f2]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-black">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <Brain className="h-4 w-4" />
          </span>
          PuzzleHub
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/55 p-1 text-xs font-medium text-black/65 shadow-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 rounded-full px-3 py-2 transition hover:bg-black hover:text-white"
            >
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/55 text-black shadow-sm md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="border-t border-black/5 bg-white/60 px-4 py-3 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5"
              >
                <link.icon className="h-5 w-5 text-black/40" />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
