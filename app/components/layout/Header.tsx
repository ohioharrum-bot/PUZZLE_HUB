'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, Hash, Puzzle, Search, Menu, X, User as UserIcon, Type } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const router = useRouter()

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
    { href: '/puzzles/sudoku', icon: Hash, label: 'Sudoku' },
    { href: '/puzzles/wordsearch', icon: Search, label: 'Word Search' },
    { href: '/puzzles/wordle', icon: Type, label: 'Wordle' },
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
          Gizmopuzzle
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

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 text-xs font-medium text-black/60 hover:text-black">
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
              <button 
                onClick={handleSignOut}
                className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-black/80"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/profile" className="flex items-center gap-2 text-xs font-medium text-black/60 hover:text-black">
                <UserIcon className="h-4 w-4" />
                My Progress
              </Link>
              <Link
                href="/auth/login"
                className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-black/80"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

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
            <hr className="my-2 border-black/5" />
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5"
                >
                  <UserIcon className="h-5 w-5 text-black/40" />
                  Profile
                </Link>
                <button
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5"
                >
                  <UserIcon className="h-5 w-5 text-black/40" />
                  My Progress
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5"
                >
                  <UserIcon className="h-5 w-5 text-black/40" />
                  Sign In
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
