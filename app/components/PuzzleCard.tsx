'use client'
import Link from 'next/link'
import { Puzzle } from '@/types/puzzle'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import AdBanner from '@/components/AdBanner'

const TYPE_LABELS: Record<string, string> = {
  sudoku: 'Sudoku',
  wordsearch: 'Word Search',
  logic: 'Logic',
  jigsaw: 'Jigsaw',
  wordle: 'Word Guesser',
  crossword: 'Crossword',
}

const TYPE_BAR: Record<string, string> = {
  sudoku: 'bar-sudoku',
  wordsearch: 'bar-wordsearch',
  logic: 'bar-logic',
  jigsaw: 'bar-jigsaw',
  wordle: 'bar-wordsearch',
  crossword: 'bar-logic',
}

const TYPE_THUMB: Record<string, string> = {
  sudoku: 'thumb-sudoku',
  wordsearch: 'thumb-wordsearch',
  logic: 'thumb-logic',
  jigsaw: 'thumb-jigsaw',
  wordle: 'thumb-wordsearch',
  crossword: 'thumb-logic',
}

const CATEGORIES = ['all', 'sudoku', 'wordsearch', 'logic', 'jigsaw', 'wordle', 'crossword'] as const

function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function PuzzleIcon({ type }: { type: string }) {
  const stroke = type === 'sudoku' ? '#3b82f6' : type === 'wordsearch' || type === 'wordle' ? '#10b981' : type === 'logic' ? '#8b5cf6' : '#f59e0b'
  if (type === 'sudoku') {
    return (
      <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  }
  if (type === 'wordsearch' || type === 'wordle') {
    return (
      <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.5">
        <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
      </svg>
    )
  }
  if (type === 'logic') {
    return (
      <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  }
  return (
    <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth="1.5">
      <path d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  )
}

export function ReferencePuzzleCard({ puzzle }: { puzzle: Puzzle }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const supabase = createClient()
  const displayType = puzzle.type === 'wordle' ? 'word-guesser' : puzzle.type
  const isGated = (puzzle.difficulty === 'medium' || puzzle.difficulty === 'hard') && isLoggedIn === false
  const pillClass = puzzle.difficulty === 'easy' ? 'pill-easy' : puzzle.difficulty === 'hard' ? 'pill-hard' : 'pill-medium'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session))
  }, [supabase])

  const href = isGated
    ? '/auth/login?message=Create a free account to play Medium and Hard puzzles'
    : `/puzzles/${displayType}/${puzzle.id}`

  return (
    <Link href={href} className="puzzle-card flex-1 flex flex-col">
      <div className={`card-color-bar ${TYPE_BAR[puzzle.type] || 'bar-sudoku'}`} />
      <div className="card-thumb">
        <div className={`card-thumb-inner ${TYPE_THUMB[puzzle.type] || 'thumb-sudoku'}`}>
          <PuzzleIcon type={puzzle.type} />
        </div>
      </div>
      <div className="card-info">
        <div className="card-meta-row">
          <span className="card-category">{TYPE_LABELS[puzzle.type] || puzzle.type}</span>
          {puzzle.is_daily && puzzle.daily_date && <span className="card-badge">{formatDate(puzzle.daily_date)}</span>}
        </div>
        <div className="card-title">{puzzle.title.replace(/\d{4}-\d{2}-\d{2}/g, (match) => formatDate(match))}</div>
        <div className="card-footer">
          <span className={`difficulty-pill ${pillClass}`}>{puzzle.difficulty}</span>
          <span className="card-players">{puzzle.play_count} playing</span>
        </div>
      </div>
      {isGated && (
        <div className="lock-overlay">
          <div className="lock-circle">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#5c5a56" strokeWidth="2">
              <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <span className="lock-text">Sign up to play</span>
        </div>
      )}
    </Link>
  )
}

export function HomePuzzleExplorer({ puzzles, daily, today }: { puzzles: Puzzle[]; daily: Puzzle[]; today: string }) {
  // Define categories: Sudoku, Word Search, Logic, Jigsaw, Crossword
  const SECTIONS = [
    { type: 'sudoku', label: 'SUDOKU', href: '/puzzles/sudoku' },
    { type: 'wordsearch', label: 'WORD SEARCH', href: '/puzzles/wordsearch' },
    { type: 'logic', label: 'LOGIC', href: '/puzzles/logic' },
    { type: 'jigsaw', label: 'JIGSAW', href: '/puzzles/jigsaw' },
    { type: 'crossword', label: 'CROSSWORD', href: '/puzzles/crossword' },
  ] as const

  // For each category, select the Easy puzzle (Daily Easy first, then most recent Easy)
  const columns = SECTIONS.map(sec => {
    // All easy puzzles for this type
    const easyPuzzles = puzzles.filter(p => p.type === sec.type && p.difficulty === 'easy')
    
    // Sort: is_daily DESC, created_at DESC
    const sorted = [...easyPuzzles].sort((a, b) => {
      if (a.is_daily !== b.is_daily) {
        return a.is_daily ? -1 : 1
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const selectedPuzzle = sorted[0] || null

    return {
      ...sec,
      puzzle: selectedPuzzle
    }
  })

  return (
    <>
      <main className="main" style={{ marginTop: 24 }}>
        <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP!} format="horizontal" />

        <div className="homepage-grid items-stretch">
          {columns.map(col => {
            if (!col.puzzle) return null
            return (
              <div key={col.type} className="homepage-column flex flex-col">
                <div className="homepage-column-header">
                  <span className="homepage-column-title">{col.label}</span>
                </div>
                <ReferencePuzzleCard puzzle={col.puzzle} />
                <Link href={col.href} className="homepage-column-link">View all</Link>
              </div>
            )
          })}
        </div>

        <AdBanner slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM!} format="rectangle" />
      </main>
    </>
  )
}

// Keep legacy export for other pages
export default function PuzzleCard({ puzzle }: { puzzle: Puzzle }) {
  return <ReferencePuzzleCard puzzle={puzzle} />
}
