'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Puzzle, SudokuPuzzleData } from '@/types/puzzle'
import { formatTime, saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { GameNav } from '@/components/layout/Header'

export default function SudokuGame({ puzzle }: { puzzle: Puzzle }) {
  const puzzleData = puzzle.puzzle_data as any
  const initialGrid: number[][] = Array.isArray(puzzleData) ? puzzleData : (puzzleData.puzzle || [])
  const solution: number[][] = (Array.isArray(puzzleData)
    ? (puzzle.solution_data as any)?.solution
    : (puzzleData.solution || (puzzle.solution_data as any)?.solution)) || []

  const [grid, setGrid] = useState<number[][]>(initialGrid.map(r => [...r]))
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [solved, setSolved] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [saving, setSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [pencilMode, setPencilMode] = useState(false)
  const [candidates, setCandidates] = useState<Map<string, Set<number>>>(new Map())

  // 9x9 grid of refs for arrow key navigation
  const cellRefs = useRef<(HTMLDivElement | null)[][]>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  )

  // ... (Restore from localStorage and Timer effects omitted for brevity, but I will include them in the replace block to ensure context is correct)
  
  // Restore from localStorage or DB
  useEffect(() => {
    const storageKey = `puzzle-completed-${puzzle.id}`
    const stored = localStorage.getItem(storageKey)
    
    if (puzzle.completed || stored) {
      try {
        let storedSeconds = 0
        if (stored) {
          const parsed = JSON.parse(stored)
          storedSeconds = parsed.seconds || 0
        }
        setSeconds(storedSeconds)
        setSolved(true)
        setHasSaved(true)
        setGrid(solution.map(r => [...r]))
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }
  }, [puzzle.id, puzzle.completed, solution])

  // Timer
  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  // Save score when solved
  useEffect(() => {
    if (!solved || hasSaved) return
    const save = async () => {
      setSaving(true)
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        // Only save to localStorage if guest (not logged in)
        if (!session) {
          saveProgressLocally(puzzle.id, seconds)
        }
        
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puzzle_id: puzzle.id,
            time_seconds: seconds
          })
        })
        setHasSaved(true)
      } catch (e) {
        console.error('❌ Failed to save score:', e)
      } finally {
        setSaving(false)
      }
    }
    save()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, hasSaved, puzzle.id, seconds])

  const toggleCandidate = useCallback((r: number, c: number, num: number) => {
    const key = `${r}-${c}`
    setCandidates(prev => {
      const newMap = new Map(prev)
      const currentSet = new Set(newMap.get(key) || [])
      if (currentSet.has(num)) {
        currentSet.delete(num)
      } else {
        currentSet.add(num)
      }
      newMap.set(key, currentSet)
      return newMap
    })
  }, [])

  // ── Cell input ─────────────────────────────────────────────
  const handleInput = useCallback((r: number, c: number, val: string) => {
    if (initialGrid[r][c] !== 0 || solved) return
    
    const num = parseInt(val.slice(-1)) || 0
    
    if (pencilMode && num !== 0) {
      toggleCandidate(r, c, num)
      return
    }

    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = num
    setGrid(newGrid)

    // Clear candidates for this cell
    setCandidates(prev => {
      const newMap = new Map(prev)
      newMap.delete(`${r}-${c}`)
      return newMap
    })

    const newErrors = new Set(errors)
    if (num !== 0 && solution[r][c] !== num) {
      if (puzzle.difficulty === 'easy') newErrors.add(`${r}-${c}`)
    } else {
      newErrors.delete(`${r}-${c}`)
    }
    setErrors(newErrors)

    const complete = newGrid.every((row, ri) =>
      row.every((cell, ci) => cell === solution[ri][ci])
    )
    if (complete) setSolved(true)
  }, [grid, errors, initialGrid, solution, solved, pencilMode, toggleCandidate, puzzle.difficulty])

  // ── Arrow key navigation ───────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selected) return

    const [r, c] = selected
    const moves: Record<string, [number, number]> = {
      ArrowUp:    [-1,  0],
      ArrowDown:  [ 1,  0],
      ArrowLeft:  [ 0, -1],
      ArrowRight: [ 0,  1],
    }

    if (moves[e.key]) {
      e.preventDefault()
      const [dr, dc] = moves[e.key]
      const nr = Math.max(0, Math.min(8, r + dr))
      const nc = Math.max(0, Math.min(8, c + dc))
      cellRefs.current[nr][nc]?.focus()
      setSelected([nr, nc])
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleInput(r, c, '0')
    } else if (/^[1-9]$/.test(e.key)) {
      handleInput(r, c, e.key)
    }
  }, [selected, handleInput])

  const reset = () => {
    setGrid(initialGrid.map(r => [...r]))
    setErrors(new Set())
    setCandidates(new Map())
    setSolved(false)
    setSeconds(0)
  }

  const filledCount = grid.reduce((acc, row) => acc + row.filter(n => n !== 0).length, 0)
  const progressPct = Math.round((filledCount / 81) * 100)
  const mistakeCount = Math.min(errors.size, 3)

  return (
    <>
      <GameNav
        title={puzzle.title}
        meta={`Sudoku · ${puzzle.difficulty}`}
        difficulty={puzzle.difficulty}
        timer={formatTime(seconds)}
        backHref="/puzzles/sudoku"
      />
      <div className="game-wrapper game-wrapper-sudoku">
        <div className="board-col">
          {solved && (
            <div className="result-box correct-result" style={{ width: '100%', maxWidth: 500, marginBottom: 16 }}>
              <div className="result-text">
                <span className="result-title correct-title">Puzzle complete!</span>
                <span className="result-explanation">
                  Finished in {formatTime(seconds)}{saving ? ' — saving score…' : ''}
                </span>
              </div>
            </div>
          )}

          <div
            className="sudoku-grid"
            role="grid"
            aria-label="Sudoku puzzle"
            onKeyDown={handleKeyDown}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isInitial = initialGrid[r][c] !== 0
                const isSelected = selected?.[0] === r && selected?.[1] === c
                const isError = errors.has(`${r}-${c}`)
                const isSameRow = selected && selected[0] === r
                const isSameCol = selected && selected[1] === c
                const isSameBox =
                  selected &&
                  Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
                  Math.floor(selected[1] / 3) === Math.floor(c / 3)
                const isUserFilled = !isInitial && cell !== 0

                return (
                  <div
                    key={`${r}-${c}`}
                    ref={el => { cellRefs.current[r][c] = el }}
                    tabIndex={isInitial || solved ? -1 : 0}
                    role="gridcell"
                    onFocus={() => setSelected([r, c])}
                    className={[
                      'sudoku-cell',
                      `row-${r + 1}`,
                      isInitial ? 'prefilled' : '',
                      isSelected ? 'selected' : '',
                      !isSelected && (isSameBox || isSameRow || isSameCol) ? 'highlighted' : '',
                      isUserFilled ? 'user-filled' : '',
                      isError ? 'error' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {cell !== 0 ? cell : pencilMode ? (
                      <span style={{ fontSize: 8, lineHeight: 1.2 }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9]
                          .filter(n => candidates.get(`${r}-${c}`)?.has(n))
                          .join('')}
                      </span>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>

          {!solved && (
            <>
              <div className="game-controls">
                <button type="button" className="ctrl-btn" onClick={reset}><span>Reset</span></button>
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={() => selected && handleInput(selected[0], selected[1], '0')}
                >
                  <span>Erase</span>
                </button>
                <button type="button" className="ctrl-btn" onClick={() => setPencilMode(!pencilMode)}>
                  <span>{pencilMode ? 'Notes ON' : 'Notes'}</span>
                </button>
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={() => {
                    const newErrors = new Set<string>()
                    grid.forEach((row, r) =>
                      row.forEach((cell, c) => {
                        if (cell !== 0 && cell !== solution[r][c]) newErrors.add(`${r}-${c}`)
                      })
                    )
                    setErrors(newErrors)
                  }}
                >
                  <span>Check</span>
                </button>
              </div>

              <div className="numpad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    type="button"
                    className="num-btn"
                    onClick={() => selected && handleInput(selected[0], selected[1], num.toString())}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="sidebar-col">
          <div className="sidebar-card">
            <div className="sidebar-card-title">Input Mode</div>
            <div className="mode-toggle">
              <button type="button" className={`mode-btn${!pencilMode ? ' active' : ''}`} onClick={() => setPencilMode(false)}>Normal</button>
              <button type="button" className={`mode-btn${pencilMode ? ' active' : ''}`} onClick={() => setPencilMode(true)}>Candidate</button>
            </div>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-card-title">Progress</div>
            <div className="progress-row">
              <span className="progress-label">Filled</span>
              <span className="progress-count">{filledCount} / 81</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="mistake-row">
                <span className="mistake-label">Mistakes</span>
                <div className="mistake-dots">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`mistake-dot${i < mistakeCount ? ' filled' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="ad-slot">
            <span className="ad-label">Advertisement</span>
            <span className="ad-size">300 × 250</span>
          </div>
        </div>
      </div>
    </>
  )
}
