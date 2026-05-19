'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PuzzlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Puzzles Error Boundary:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-2xl mt-10">
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[40px] border border-black/10 bg-white/65 p-10 text-center shadow-xl backdrop-blur-md">
        <div className="mb-6 rounded-full bg-red-50 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight text-black">Puzzle could not be loaded</h2>
        <p className="mt-4 text-base text-black/50 leading-relaxed">
          {error.message.includes('UUID') 
            ? "The puzzle link seems to be invalid or has expired."
            : "We encountered a temporary issue while fetching the puzzle data. Please try again."}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 active:scale-95"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-black/10 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-black/5 active:scale-95"
          >
            Back to Home
          </Link>
        </div>
        
        {error.digest && (
          <p className="mt-10 text-[9px] font-mono text-black/20 uppercase tracking-[0.2em]">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
