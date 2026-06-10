'use client'
import { useState, useEffect, useCallback } from 'react'
import { Puzzle, WordGuesserPuzzleData } from '@/types/puzzle'
import { saveProgressLocally, formatTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

const MAX_GUESSES = 6
const WORD_LENGTH = 5

export default function WordGuesserGame({ puzzle }: { puzzle: Puzzle }) {
  const { solution } = puzzle.puzzle_data as WordGuesserPuzzleData
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [hasSaved, setHasSaved] = useState(false)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Timer
  useEffect(() => {
    if (solved || failed) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved, failed])

  // Restore from localStorage or DB
  useEffect(() => {
    const storageKey = `puzzle-completed-${puzzle.id}`
    const stored = localStorage.getItem(storageKey)
    if (puzzle.completed || stored) {
      try {
        let storedSeconds = 0
        let storedGuesses = []
        if (stored) {
          const parsed = JSON.parse(stored)
          storedSeconds = parsed.seconds || 0
          storedGuesses = parsed.guesses || []
        }
        setSeconds(storedSeconds)
        if (storedGuesses.length > 0) {
          setGuesses(storedGuesses)
        } else if (puzzle.completed) {
          // If completed in DB but no local guesses, at least show it as solved
          setGuesses([solution.toLowerCase()])
        }
        setSolved(true)
        setHasSaved(true)
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }
  }, [puzzle.id, puzzle.completed, solution])

  const submitGuess = useCallback(async () => {
    if (currentGuess.length !== WORD_LENGTH || solved || failed || loading) return

    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentGuess.toLowerCase()}`)
      if (!res.ok) {
        setShake(true)
        setError('Not a valid word')
        setTimeout(() => {
          setShake(false)
          setError('')
        }, 1500)
        setLoading(false)
        return
      }
    } catch (e) {
      console.error('Dictionary API error:', e)
      // On error, we'll allow the guess to proceed to not block gameplay
    }

    const lowerGuess = currentGuess.toLowerCase()
    const newGuesses = [...guesses, lowerGuess]
    setGuesses(newGuesses)
    setCurrentGuess('')
    setLoading(false)

    if (lowerGuess === solution.toLowerCase()) {
      setSolved(true)
      if (!hasSaved) {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) saveProgressLocally(puzzle.id, seconds)
        
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puzzle_id: puzzle.id, time_seconds: seconds })
        })
        setHasSaved(true)
      }
    } else if (newGuesses.length >= MAX_GUESSES) {
      setFailed(true)
    }
  }, [currentGuess, guesses, solved, failed, solution, puzzle.id, seconds, hasSaved, loading])

  const onKey = useCallback((key: string) => {
    if (solved || failed || loading) return
    if (key === 'Enter') {
      if (currentGuess.length < WORD_LENGTH) {
        setShake(true)
        setTimeout(() => setShake(false), 500)
      } else {
        submitGuess()
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key.toUpperCase())
    }
  }, [currentGuess, solved, failed, loading, submitGuess])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => onKey(e.key)
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onKey])

  const getStatus = (guess: string, index: number) => {
    const char = guess[index].toLowerCase()
    const sol = solution.toLowerCase()
    const guessLower = guess.toLowerCase()
    
    // 1. Correct spot
    if (sol[index] === char) return 'correct'
    
    // 2. Present but wrong spot (with consumption logic)
    // Count how many times this char appears in the solution
    let solCount = 0
    for (let i = 0; i < sol.length; i++) {
      if (sol[i] === char) solCount++
    }
    
    // Count how many times this char is already marked 'correct' in the guess
    let correctCount = 0
    for (let i = 0; i < guessLower.length; i++) {
      if (guessLower[i] === char && sol[i] === char) correctCount++
    }
    
    // Count how many times this char appeared earlier in the guess (that were not 'correct')
    let earlierPresentCount = 0
    for (let i = 0; i < index; i++) {
      if (guessLower[i] === char && sol[i] !== char) earlierPresentCount++
    }
    
    if (sol.includes(char) && (earlierPresentCount < (solCount - correctCount))) {
      return 'present'
    }
    
    return 'absent'
  }

  const getKeyStatus = (char: string) => {
    let status = ''
    guesses.forEach(guess => {
      guess.split('').forEach((letter, i) => {
        if (letter !== char) return
        const currentStatus = getStatus(guess, i)
        if (currentStatus === 'correct') status = 'correct'
        else if (currentStatus === 'present' && status !== 'correct') status = 'present'
        else if (currentStatus === 'absent' && status !== 'correct' && status !== 'present') status = 'absent'
      })
    })
    return status
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full text-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-black/70 bg-white/60 px-3 py-1 rounded-full border border-black/5 shadow-sm">{formatTime(seconds)}</span>
          <span className="capitalize px-3 py-1 rounded-full border border-black/10 bg-white/60 text-xs font-medium text-black/50">{puzzle.difficulty}</span>
        </div>
      </div>

      <div className="relative w-full">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          </div>
        )}
        <div className="grid grid-rows-6 gap-2 w-full aspect-[5/6]">
          {[...Array(MAX_GUESSES)].map((_, i) => {
            const guess = guesses[i] || (i === guesses.length ? currentGuess : '')
            const isCurrent = i === guesses.length
            const isSubmitted = i < guesses.length

            return (
              <div key={i} className={`grid grid-cols-5 gap-2 ${isCurrent && shake ? 'animate-shake' : ''}`}>
                {[...Array(WORD_LENGTH)].map((_, j) => {
                  const char = guess[j] || ''
                  const status = isSubmitted ? getStatus(guess, j) : ''
                  
                  return (
                    <div
                      key={j}
                      className={`
                        aspect-square flex items-center justify-center text-2xl font-black rounded-xl border-2 transition-all duration-500 text-black
                        ${!isSubmitted ? 'border-black/10 bg-white' : ''}
                        ${isSubmitted && status === 'correct' ? 'bg-green-500 border-green-600' : ''}
                        ${isSubmitted && status === 'present' ? 'bg-yellow-500 border-yellow-600' : ''}
                        ${isSubmitted && status === 'absent' ? 'bg-black/20 border-black/5 opacity-40' : ''}
                        ${isCurrent && char ? 'border-black/30 scale-105 shadow-sm' : ''}
                      `}
                    >
                      {char}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div className="w-full space-y-2 mt-4">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map(key => {
              const status = getKeyStatus(key.toLowerCase())
              const isSpecial = key.length > 1
              return (
                <button
                  key={key}
                  disabled={loading}
                  onClick={() => onKey(key)}
                  className={`
                    flex items-center justify-center rounded-lg font-bold text-xs sm:text-sm h-12 transition-all active:scale-95 text-black disabled:opacity-50
                    ${isSpecial ? 'px-3 sm:px-4' : 'flex-1'}
                    ${!status ? 'bg-white border border-black/10 hover:bg-black/5' : ''}
                    ${status === 'correct' ? 'bg-green-500 border-green-600' : ''}
                    ${status === 'present' ? 'bg-yellow-500 border-yellow-600' : ''}
                    ${status === 'absent' ? 'bg-black/10 text-black/40' : ''}
                  `}
                >
                  {key === 'Backspace' ? '←' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {(solved || failed) && (
        <div className={`w-full p-6 rounded-[28px] border-2 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl ${
          solved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`text-xl font-bold mb-1 ${solved ? 'text-green-800' : 'text-red-800'}`}>
            {solved ? '🎉 Incredible!' : '😔 Out of guesses'}
          </h3>
          <p className="text-sm opacity-70 mb-4">
            {solved ? `Solved in ${guesses.length} tries` : `The word was ${solution.toUpperCase()}`}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-black text-white font-bold text-sm shadow-lg shadow-black/10"
          >
            Play Another
          </button>
        </div>
      )}
    </div>
  )
}
