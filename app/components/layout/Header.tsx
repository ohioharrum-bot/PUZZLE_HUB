'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import Footer from '@/components/layout/Footer'

const LOGO_SVG = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
    <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
)

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname.startsWith('/auth')
  const isGame = /^\/puzzles\/(sudoku|logic|jigsaw|word-guesser|wordsearch|crossword)\/[^/]+$/.test(pathname)

  if (isAuth || isGame) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="site-container">{children}</main>
      <Footer />
    </>
  )
}

export function GameNav({
  title,
  meta,
  difficulty,
  timer,
  backHref = '/',
  backLabel = 'All Puzzles',
  dark = false,
  children,
}: {
  title: string
  meta: string
  difficulty: string
  timer: string
  backHref?: string
  backLabel?: string
  dark?: boolean
  children?: React.ReactNode
}) {
  const pillClass =
    difficulty === 'easy' ? 'pill-easy' :
    difficulty === 'hard' ? 'pill-hard' : 'pill-medium'

  return (
    <nav className={`game-nav${dark ? ' game-nav-dark' : ''}`}>
      <div className="nav-left">
        <Link href={backHref} className="nav-back">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Link>
        <div className="nav-divider" />
        <div>
          <div className="nav-puzzle-name">{title}</div>
          <div className="nav-puzzle-meta">{meta}</div>
        </div>
      </div>
      <div className="nav-actions">
        <span className={`difficulty-pill ${pillClass}`}>{difficulty}</span>
        <span className="nav-timer">{timer}</span>
        {children}
      </div>
    </nav>
  )
}

export function SiteLogo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="nav-logo">
      <div className="nav-logo-icon">{LOGO_SVG}</div>
      Gizmopuzzle
    </Link>
  )
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'All Puzzles', match: pathname === '/' },
    { href: '/puzzles/sudoku', label: 'Sudoku', match: pathname.startsWith('/puzzles/sudoku') },
    { href: '/puzzles/wordsearch', label: 'Word Search', match: pathname.startsWith('/puzzles/wordsearch') },
    { href: '/puzzles/logic', label: 'Logic', match: pathname.startsWith('/puzzles/logic') },
    { href: '/puzzles/jigsaw', label: 'Jigsaw', match: pathname.startsWith('/puzzles/jigsaw') },
    { href: '/puzzles/crossword', label: 'Crossword', match: pathname.startsWith('/puzzles/crossword') },
  ]

  return (
    <header>
      <nav className="site-nav">
        <SiteLogo />

        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={link.match ? 'active' : undefined}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          {user ? (
            <>
              <Link href="/profile" className="btn-ghost">Profile</Link>
              <button type="button" onClick={handleSignOut} className="btn-primary">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost">Log in</Link>
              <Link href="/auth/login" className="btn-primary">Sign up free</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
