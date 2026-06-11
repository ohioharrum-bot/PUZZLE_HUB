'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Brain, Hash, Puzzle, Search, Menu, X, User as UserIcon, Type, ShieldCheck, Newspaper } from 'lucide-react'
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
    { href: '/puzzles/word-guesser', icon: Type, label: 'Word Guesser' },
    { href: '/puzzles/jigsaw', icon: Puzzle, label: 'Jigsaw' },
    { href: '/puzzles/logic', icon: Brain, label: 'Logic' },
    { href: '/blog', icon: Newspaper, label: 'Blogs' },
    { href: '/privacy', icon: ShieldCheck, label: 'Privacy Policy' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#eef0f2]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-5 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-black">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
            <Brain className="h-4 w-4" />
          </span>
          Gizmopuzzle
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/55 p-1 text-[11px] font-medium text-black/65 shadow-sm xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-black hover:text-white"
            >
              <link.icon className="w-3.5 h-3.5" /> {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
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
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/55 text-black shadow-sm xl:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="fixed inset-x-0 bottom-0 top-[73px] z-50 h-[calc(100vh-73px)] overflow-y-auto bg-[#eef0f2] px-6 pb-20 pt-8 xl:hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col gap-3">
            <div className="mb-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Daily Puzzles</p>
            </div>
            
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setIsOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-white px-6 py-4 text-base font-bold text-black shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/40">
                    <link.icon className="h-5 w-5" />
                  </span>
                  {link.label}
                </div>
                <div className="h-2 w-2 rounded-full bg-black/5" />
              </Link>
            ))}
            
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/5" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Account & Help</p>
              <div className="h-px flex-1 bg-black/5" />
            </div>

            <div className="flex flex-col items-center gap-3">
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-5 text-base font-bold text-black shadow-sm"
              >
                <UserIcon className="h-5 w-5 opacity-40" />
                Contact Support
              </Link>

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-5 text-base font-bold text-black shadow-sm"
                  >
                    <UserIcon className="h-5 w-5 opacity-40" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-50 px-6 py-5 text-base font-bold text-red-600 shadow-sm"
                  >
                    <UserIcon className="h-5 w-5 opacity-40" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-5 text-base font-bold text-black shadow-sm"
                  >
                    <UserIcon className="h-5 w-5 opacity-40" />
                    My Progress
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-5 text-base font-bold text-white shadow-lg shadow-black/10"
                  >
                    <UserIcon className="h-5 w-5 opacity-40" />
                    Sign In to Sync
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 pb-10 text-center">
              <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-black">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                  <Brain className="h-4 w-4" />
                </span>
                Gizmopuzzle
              </Link>
              <p className="max-w-[200px] text-[10px] font-medium leading-relaxed text-black/30">
                Crafted with love for puzzle lovers.<br/>© {new Date().getFullYear()} Gizmopuzzle Studio.
              </p>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
