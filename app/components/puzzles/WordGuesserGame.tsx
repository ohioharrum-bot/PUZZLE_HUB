'use client'
import { useState, useEffect, useCallback } from 'react'
import { Puzzle, WordGuesserPuzzleData } from '@/types/puzzle'
import { saveProgressLocally, formatTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { GameNav } from '@/components/layout/Header'

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
    <>
      <GameNav
        title={puzzle.title}
        meta={`Word Game · ${puzzle.difficulty}`}
        difficulty={puzzle.difficulty}
        timer={formatTime(seconds)}
        backHref="/puzzles/word-guesser"
      />
      <div className="game-wrapper game-wrapper-word">
        <div className="legend">
          <div className="legend-item"><div className="legend-dot" style={{ background: '#16a34a' }} />Correct spot</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#ca8a04' }} />Wrong spot</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#e2e0db' }} />Not in word</div>
        </div>

        <div className="relative w-full" style={{ maxWidth: 340 }}>
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-bold">{error}</div>
            </div>
          )}
          <div className={`word-grid${shake ? ' animate-shake' : ''}`}>
            {[...Array(MAX_GUESSES)].map((_, i) => {
              const guess = guesses[i] || (i === guesses.length ? currentGuess : '')
              const isCurrent = i === guesses.length
              const isSubmitted = i < guesses.length
              return (
                <div key={i} className="word-row">
                  {[...Array(WORD_LENGTH)].map((_, j) => {
                    const char = guess[j] || ''
                    const status = isSubmitted ? getStatus(guess, j) : ''
                    return (
                      <div
                        key={j}
                        className={[
                          'word-cell',
                          char && !isSubmitted ? 'filled' : '',
                          isCurrent && !isSubmitted ? 'active-row' : '',
                          isSubmitted && status ? status : '',
                        ].filter(Boolean).join(' ')}
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

        <div className="keyboard">
          {[
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
          ].map((row, i) => (
            <div key={i} className="key-row">
              {row.map(key => {
                const status = key.length === 1 ? getKeyStatus(key.toLowerCase()) : ''
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={loading}
                    onClick={() => onKey(key)}
                    className={['key', key.length > 1 ? 'wide' : '', status].filter(Boolean).join(' ')}
                  >
                    {key === 'Backspace' ? '←' : key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {(solved || failed) && (
          <div className="result-banner">
            <span className="result-label">{solved ? 'You solved it' : 'Out of guesses'}</span>
            {failed && <div className="result-word">{solution.toUpperCase()}</div>}
            <p className="result-sub">
              {solved ? `Solved in ${guesses.length} tries` : `The correct answer was: ${solution.toUpperCase()}`}
            </p>
            <div className="result-actions">
              <button type="button" className="btn-play-again" onClick={() => window.location.reload()}>Play again</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
