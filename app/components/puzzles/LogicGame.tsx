'use client'
import { useState, useEffect } from 'react'
import { LogicPuzzleData, Puzzle } from '@/types/puzzle'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

const MAX_ATTEMPTS = 3
const TIME_LIMIT_SECONDS = 300

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

export default function LogicGame({ puzzle }: { puzzle: Puzzle }) {
  const { question, answer, hint, options, explanation } = puzzle.puzzle_data as LogicPuzzleData
  const [selected, setSelected] = useState<string | null>(null)
  const [wrongSelections, setWrongSelections] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [solved, setSolved] = useState(false)
  const [gameOverReason, setGameOverReason] = useState<'correct' | 'wrong' | 'timeout' | 'giveup' | null>(null)

  const isCorrectOption = (opt: string) => normalizeAnswer(opt) === normalizeAnswer(answer)
  const correctOption = options.find(isCorrectOption) ?? answer
  const isCorrect = selected !== null && isCorrectOption(selected)
  const gameOver = solved || gameOverReason !== null

  useEffect(() => {
    if (puzzle.completed) {
      setSolved(true)
      setSelected(correctOption)
      setRevealed(true)
      setGameOverReason('correct')
      return
    }

    const storageKey = `puzzle-completed-${puzzle.id}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const { seconds: storedSeconds } = JSON.parse(stored)
        setSeconds(storedSeconds)
        setSolved(true)
        setSelected(correctOption)
        setRevealed(true)
        setGameOverReason('correct')
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }
  }, [puzzle.id, puzzle.completed, correctOption])

  useEffect(() => {
    if (gameOver) return
    const t = setInterval(() => {
      setSeconds(s => {
        if (s + 1 >= TIME_LIMIT_SECONDS) {
          setRevealed(true)
          setGameOverReason('timeout')
          return TIME_LIMIT_SECONDS
        }
        return s + 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [gameOver])

  const saveScore = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      saveProgressLocally(puzzle.id, seconds)
    }

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzle_id: puzzle.id,
          time_seconds: seconds
        })
      })
    } catch (e) {
      console.error('❌ Failed to submit score:', e)
    }
  }

  const handleSelect = async (opt: string) => {
    if (gameOver || wrongSelections.includes(opt)) return
    setSelected(opt)

    if (isCorrectOption(opt)) {
      setSolved(true)
      setRevealed(true)
      setGameOverReason('correct')
      await saveScore()
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setWrongSelections(prev => [...prev, opt])

    if (nextAttempts >= MAX_ATTEMPTS) {
      setRevealed(true)
      setGameOverReason('wrong')
    }
  }

  const handleGiveUp = () => {
    if (gameOver) return
    setRevealed(true)
    setGameOverReason('giveup')
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const timeRemaining = Math.max(0, TIME_LIMIT_SECONDS - seconds)
  const showAnswer = gameOverReason !== null

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6 space-y-5">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Time {fmt(seconds)} · {attempts}/{MAX_ATTEMPTS} guesses</span>
        <span className="capitalize px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">{puzzle.difficulty}</span>
      </div>

      {!gameOver && (
        <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
          {fmt(timeRemaining)} remaining
        </p>
      )}

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-slate-900 font-semibold leading-relaxed">{question}</p>
      </div>

      <div className="grid gap-3">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={gameOver || wrongSelections.includes(opt)}
            className={[
              'text-left px-4 py-3 rounded-xl border-2 transition-all font-semibold text-slate-800',
              revealed && isCorrectOption(opt) ? 'border-green-500 bg-green-50 text-green-800' : '',
              wrongSelections.includes(opt) ? 'border-red-400 bg-red-50 text-red-700 opacity-70' : '',
              !gameOver && !wrongSelections.includes(opt) ? 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer' : '',
              gameOver && !isCorrectOption(opt) && !wrongSelections.includes(opt) ? 'border-gray-200 opacity-60' : '',
            ].join(' ')}
          >
            <span className="mr-2 text-xs uppercase tracking-wide text-gray-400">
              {revealed && isCorrectOption(opt) ? 'Correct' : wrongSelections.includes(opt) ? 'Wrong' : 'Option'}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {attempts > 0 && !solved && !revealed && (
        <p className="text-sm text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
          Not quite — you have {MAX_ATTEMPTS - attempts} guess{MAX_ATTEMPTS - attempts === 1 ? '' : 'es'} left.
        </p>
      )}

      {showAnswer && (
        <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
          <p className="font-semibold">
            {isCorrect ? 'Correct!' : gameOverReason === 'timeout' ? "Time's up!" : gameOverReason === 'giveup' ? 'You gave up' : 'Out of guesses'}
          </p>
          {!isCorrect && (
            <p className="text-sm mt-2 font-medium">
              The correct answer was: <span className="font-bold">{correctOption}</span>
            </p>
          )}
          {(explanation || hint) && !isCorrect && (
            <p className="text-sm mt-2 opacity-90">
              <strong>Explanation:</strong> {explanation || hint}
            </p>
          )}
          {isCorrect && <p className="text-xs mt-2 opacity-70">Solved in {fmt(seconds)}</p>}
        </div>
      )}

      {!gameOver && (
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setShowHint(!showHint)} className="text-sm text-indigo-500 hover:underline">
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
          <button onClick={handleGiveUp} className="text-sm text-red-500 hover:underline">
            Give up
          </button>
        </div>
      )}
      {showHint && !gameOver && (
        <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-yellow-800">
          Hint: {hint}
        </p>
      )}
    </div>
  )
}
