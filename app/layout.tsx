import type { Metadata } from 'next'
import { Manrope, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/layout/Header'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gizmopuzzle – Free Online Puzzles',
  description: 'Solve Sudoku, Word Search, Jigsaw, and Logic puzzles online for free.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2806693520305823"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${manrope.variable} ${robotoMono.variable} min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--off-white)] font-sans text-[var(--black)]`}
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
