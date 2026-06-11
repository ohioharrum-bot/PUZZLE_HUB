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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
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
        <nav className="fixed inset-x-0 bottom-0 top-[57px] z-50 overflow-y-auto bg-[#eef0f2] px-4 pb-24 pt-6 xl:hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 rounded-2xl bg-white/60 px-5 py-4 text-base font-semibold text-black transition active:scale-[0.98] active:bg-black active:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/40 group-active:text-white">
                  <link.icon className="h-5 w-5" />
                </span>
                {link.label}
              </Link>
            ))}
            
            <hr className="my-6 border-black/5" />
            
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 rounded-2xl bg-white/50 px-5 py-4 text-base font-medium text-black transition active:bg-black active:text-white"
            >
              <UserIcon className="h-5 w-5 opacity-40" />
              Contact Support
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-2xl bg-white/50 px-5 py-4 text-base font-medium text-black transition active:bg-black active:text-white"
                >
                  <UserIcon className="h-5 w-5 opacity-40" />
                  Profile
                </Link>
                <button
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="flex items-center gap-4 rounded-2xl bg-red-50 px-5 py-4 text-base font-medium text-red-600 transition active:bg-red-600 active:text-white"
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
                  className="flex items-center gap-4 rounded-2xl bg-white/50 px-5 py-4 text-base font-medium text-black transition active:bg-black active:text-white"
                >
                  <UserIcon className="h-5 w-5 opacity-40" />
                  My Progress
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-2xl bg-black px-5 py-4 text-base font-medium text-white transition active:bg-black/80"
                >
                  <UserIcon className="h-5 w-5 opacity-40" />
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
