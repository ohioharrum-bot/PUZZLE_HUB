import type { Metadata } from 'next'
import { Poppins, Roboto_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
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
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

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
        className={`${poppins.variable} ${robotoMono.variable} min-h-screen w-full max-w-full overflow-x-hidden bg-[#eef0f2] font-sans text-[#111318]`}
        suppressHydrationWarning
      >
        <Header />
        <main className="site-container">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
