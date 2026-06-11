import Link from 'next/link'
import { Brain, Heart, Code, Send, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-7xl px-4 pb-12 md:px-6">
      <div className="rounded-[34px] border border-black/10 bg-white/60 p-8 backdrop-blur shadow-sm md:p-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-black">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                <Brain className="h-5 w-5" />
              </span>
              Gizmopuzzle
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-black/45">
              A collection of quiet, focused puzzles designed for daily mental exercise and calm problem solving. Free to play, always.
            </p>
            <div className="flex gap-3">
              <SocialLink href="#" icon={Send} />
              <SocialLink href="#" icon={Code} />
              <SocialLink href="#" icon={Mail} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-black/30">Puzzles</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><FooterLink href="/puzzles/sudoku">Sudoku</FooterLink></li>
                <li><FooterLink href="/puzzles/wordsearch">Word Search</FooterLink></li>
                <li><FooterLink href="/puzzles/word-guesser">Word Guesser</FooterLink></li>
                <li><FooterLink href="/puzzles/jigsaw">Jigsaw</FooterLink></li>
                <li><FooterLink href="/puzzles/logic">Logic</FooterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-black/30">Platform</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><FooterLink href="/blog">Puzzle Blog</FooterLink></li>
                <li><FooterLink href="/profile">My Progress</FooterLink></li>
                <li><FooterLink href="/contact">Contact Support</FooterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-black/30">Legal</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
                <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-black/5 pt-8 text-center md:flex-row md:text-left">
          <p className="text-[11px] font-medium text-black/30">
            © {new Date().getFullYear()} Gizmopuzzle Studio. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-black/30">
            Built with <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400" /> for puzzle lovers
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-black/60 transition hover:text-black">
      {children}
    </Link>
  )
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <Link 
      href={href} 
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-black/5 text-black/40 transition hover:bg-black hover:text-white"
    >
      <Icon className="h-4 w-4" />
    </Link>
  )
}
