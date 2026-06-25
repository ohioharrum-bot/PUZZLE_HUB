'use client'
import { useState, useEffect } from 'react'
import { LogicPuzzleData, Puzzle } from '@/types/puzzle'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { GameNav } from '@/components/layout/Header'

const MAX_ATTEMPTS = 3
const TIME_LIMIT_SECONDS = 300

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function LogicGame({ puzzle }: { puzzle: Puzzle }) {
  const { question, answer, hint, options, explanation } = puzzle.puzzle_data as LogicPuzzleData
  const [selected, setSelected] = useState<string | null>(null)
  const [wrongSelections, setWrongSelections] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [timerFill, setTimerFill] = useState(100)
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

  useEffect(() => {
    if (gameOver) return
    const t = setInterval(() => {
      setTimerFill(f => Math.max(0, f - (100 / TIME_LIMIT_SECONDS)))
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
  const showAnswer = gameOverReason !== null
  const progressPct = Math.min(100, ((attempts + (solved ? 1 : 0)) / MAX_ATTEMPTS) * 100)

  return (
    <>
      <GameNav
        title={puzzle.title}
        meta={`Logic · ${MAX_ATTEMPTS} attempts max`}
        difficulty={puzzle.difficulty}
        timer={fmt(seconds)}
        backHref="/puzzles/logic"
      />
      <div className="game-wrapper logic-theme">
        <div className="question-col">
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="quiz-progress-text">{attempts}/{MAX_ATTEMPTS} attempts</span>
          </div>

          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Logic Puzzle</span>
              {!gameOver && (
                <button type="button" className="hint-btn" onClick={() => setShowHint(!showHint)}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              )}
            </div>

            <div className="question-text">{question}</div>

            {showHint && !gameOver && (
              <div className="hint-box visible">Hint: {hint}</div>
            )}

            {!gameOver && (
              <div className="question-timer-bar">
                <div className="question-timer-fill" style={{ width: `${timerFill}%` }} />
              </div>
            )}

            <div className="options-grid">
              {options.map((opt: string, i: number) => {
                const isWrong = wrongSelections.includes(opt)
                const isCorrectOpt = revealed && isCorrectOption(opt)
                const isSelected = selected === opt && !revealed
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    disabled={gameOver || isWrong}
                    className={[
                      'option-btn',
                      isCorrectOpt ? 'correct' : '',
                      isWrong ? 'wrong' : '',
                      isSelected ? 'selected' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <div className="option-letter">{LETTERS[i] ?? '?'}</div>
                    {opt}
                  </button>
                )
              })}
            </div>

            {attempts > 0 && !solved && !revealed && (
              <p className="text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                Not quite — you have {MAX_ATTEMPTS - attempts} guess{MAX_ATTEMPTS - attempts === 1 ? '' : 'es'} left.
              </p>
            )}

            {showAnswer && (
              <div className={`result-box ${isCorrect ? 'correct-result' : 'wrong-result'}`}>
                <div className={`result-icon ${isCorrect ? 'correct-icon' : 'wrong-icon'}`}>
                  {isCorrect ? (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                      <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  )}
                </div>
                <div className="result-text">
                  <span className={`result-title ${isCorrect ? 'correct-title' : 'wrong-title'}`}>
                    {isCorrect ? 'Correct!' : gameOverReason === 'timeout' ? "Time's up!" : gameOverReason === 'giveup' ? 'You gave up' : 'Out of guesses'}
                  </span>
                  {!isCorrect && (
                    <span className="result-explanation">
                      The correct answer was: <strong>{correctOption}</strong>
                      {(explanation || hint) && <> — {explanation || hint}</>}
                    </span>
                  )}
                  {isCorrect && (
                    <span className="result-explanation">Solved in {fmt(seconds)}</span>
                  )}
                </div>
              </div>
            )}

            {!gameOver && (
              <div className="question-actions">
                <button type="button" className="btn-skip" onClick={handleGiveUp}>Give up</button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-col">
          <div className="sidebar-card">
            <div className="sidebar-card-title">Progress</div>
            <div className="score-display">
              <div className="score-number">{solved ? '✓' : MAX_ATTEMPTS - attempts}</div>
              <div className="score-label">{solved ? 'Solved' : 'Attempts left'}</div>
              <div className="score-breakdown">
                <div className="score-item">
                  <div className="score-item-num green">{solved ? 1 : 0}</div>
                  <div className="score-item-label">Correct</div>
                </div>
                <div className="score-item">
                  <div className="score-item-num red">{wrongSelections.length}</div>
                  <div className="score-item-label">Wrong</div>
                </div>
                <div className="score-item">
                  <div className="score-item-num">{fmt(seconds)}</div>
                  <div className="score-item-label">Time</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-title">Difficulty</div>
            <div className="streak-display">
              <div className="streak-left">
                <div className="streak-num capitalize">{puzzle.difficulty}</div>
                <div className="streak-label">Level</div>
              </div>
              <div className="streak-flame">🧩</div>
            </div>
          </div>

          <div className="ad-slot">
            <div className="ad-label">Advertisement</div>
            <span className="ad-size">300 × 250</span>
          </div>
        </div>
      </div>
    </>
  )
}
