'use client'
import { useState, useEffect, useRef } from 'react'
import { Puzzle } from '@/types/puzzle'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { GameNav } from '@/components/layout/Header'

interface Clue {
  number: number
  clue: string
  answer: string
  row: number
  col: number
}

interface CrosswordPuzzleData {
  grid: string[][]
  clues: {
    across: Clue[]
    down: Clue[]
  }
}

export default function CrosswordGame({ puzzle }: { puzzle: Puzzle }) {
  const { grid: solutionGrid, clues } = puzzle.puzzle_data as unknown as CrosswordPuzzleData
  
  // Size of the crossword grid
  const rowsCount = solutionGrid.length
  const colsCount = solutionGrid[0].length

  // User input grid: initialize empty string for non-blockers (non-empty in solutionGrid), and null for blocker cells
  const [userGrid, setUserGrid] = useState<(string | null)[][]>(() => {
    return solutionGrid.map(row => 
      row.map(cell => (cell === '' || cell === '#' ? null : ''))
    )
  })

  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)
  const [solved, setSolved] = useState(false)
  const [checked, setChecked] = useState(false)
  const [wrongCells, setWrongCells] = useState<boolean[][]>(
    Array(rowsCount).fill(null).map(() => Array(colsCount).fill(false))
  )
  const [seconds, setSeconds] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const cellRefs = useRef<HTMLInputElement[][]>([])

  // Load completion status
  useEffect(() => {
    if (puzzle.completed) {
      setSolved(true)
      setGameOver(true)
      setUserGrid(solutionGrid.map(row => row.map(cell => (cell === '' || cell === '#' ? null : cell))))
      return
    }

    const storageKey = `puzzle-completed-${puzzle.id}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const { seconds: storedSeconds } = JSON.parse(stored)
        setSeconds(storedSeconds)
        setSolved(true)
        setGameOver(true)
        setUserGrid(solutionGrid.map(row => row.map(cell => (cell === '' || cell === '#' ? null : cell))))
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }
  }, [puzzle.id, puzzle.completed, solutionGrid])

  // Timer
  useEffect(() => {
    if (gameOver) return
    const t = setInterval(() => {
      setSeconds(s => s + 1)
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

  // Find cell number (clue start)
  const getCellNumber = (r: number, c: number): number | null => {
    const acrossClue = clues.across.find(clue => clue.row === r && clue.col === c)
    if (acrossClue) return acrossClue.number

    const downClue = clues.down.find(clue => clue.row === r && clue.col === c)
    if (downClue) return downClue.number

    return null
  }

  // Handle cell text changes
  const handleCellChange = (r: number, c: number, val: string) => {
    if (gameOver) return
    const char = val.toUpperCase().slice(-1)
    
    const newGrid = userGrid.map((rowArr, rowIndex) => 
      rowArr.map((cellVal, colIndex) => {
        if (rowIndex === r && colIndex === c) {
          return char
        }
        return cellVal
      })
    )
    setUserGrid(newGrid)
    
    // Reset check state on edit
    setChecked(false)
    setWrongCells(Array(rowsCount).fill(null).map(() => Array(colsCount).fill(false)))

    // Auto-advance cursor to the next valid input cell in the same row/col if a letter was typed
    if (char !== '') {
      focusNextCell(r, c)
    }
  }

  const focusNextCell = (r: number, c: number) => {
    // Try to go right in the same row
    let nextCol = c + 1
    while (nextCol < colsCount) {
      if (userGrid[r][nextCol] !== null) {
        cellRefs.current[r]?.[nextCol]?.focus()
        return
      }
      nextCol++
    }

    // Otherwise, try to find next row with a cell
    let nextRow = r + 1
    while (nextRow < rowsCount) {
      for (let nextC = 0; nextC < colsCount; nextC++) {
        if (userGrid[nextRow][nextC] !== null) {
          cellRefs.current[nextRow]?.[nextC]?.focus()
          return
        }
      }
      nextRow++
    }
  }

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameOver) return

    if (e.key === 'Backspace' && userGrid[r][c] === '') {
      // Move cursor back on Backspace if empty
      // Try to go left
      let prevCol = c - 1
      while (prevCol >= 0) {
        if (userGrid[r][prevCol] !== null) {
          cellRefs.current[r]?.[prevCol]?.focus()
          return
        }
        prevCol--
      }

      // Try to go to previous row
      let prevRow = r - 1
      while (prevRow >= 0) {
        let prevColEnd = colsCount - 1
        while (prevColEnd >= 0) {
          if (userGrid[prevRow][prevColEnd] !== null) {
            cellRefs.current[prevRow]?.[prevColEnd]?.focus()
            return
          }
          prevColEnd--
        }
        prevRow--
      }
    } else if (e.key === 'ArrowRight') {
      let nextCol = c + 1
      while (nextCol < colsCount) {
        if (userGrid[r][nextCol] !== null) {
          cellRefs.current[r]?.[nextCol]?.focus()
          return
        }
        nextCol++
      }
    } else if (e.key === 'ArrowLeft') {
      let prevCol = c - 1
      while (prevCol >= 0) {
        if (userGrid[r][prevCol] !== null) {
          cellRefs.current[r]?.[prevCol]?.focus()
          return
        }
        prevCol--
      }
    } else if (e.key === 'ArrowDown') {
      let nextRow = r + 1
      while (nextRow < rowsCount) {
        if (userGrid[nextRow][c] !== null) {
          cellRefs.current[nextRow]?.[c]?.focus()
          return
        }
        nextRow++
      }
    } else if (e.key === 'ArrowUp') {
      let prevRow = r - 1
      while (prevRow >= 0) {
        if (userGrid[prevRow][c] !== null) {
          cellRefs.current[prevRow]?.[c]?.focus()
          return
        }
        prevRow--
      }
    }
  }

  const checkSolution = async () => {
    if (gameOver) return

    let isAllCorrect = true
    const newWrongCells = Array(rowsCount).fill(null).map(() => Array(colsCount).fill(false))

    for (let r = 0; r < rowsCount; r++) {
      for (let c = 0; c < colsCount; c++) {
        if (userGrid[r][c] !== null) {
          const userVal = userGrid[r][c]?.toUpperCase()
          const solVal = solutionGrid[r][c]?.toUpperCase()
          if (userVal !== solVal) {
            newWrongCells[r][c] = true
            isAllCorrect = false
          }
        }
      }
    }

    setWrongCells(newWrongCells)
    setChecked(true)

    if (isAllCorrect) {
      setSolved(true)
      setGameOver(true)
      await saveScore()
    }
  }

  const handleReveal = () => {
    setUserGrid(solutionGrid.map(row => row.map(cell => (cell === '' || cell === '#' ? null : cell))))
    setSolved(false)
    setGameOver(true)
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <>
      <GameNav
        title={puzzle.title}
        meta="Crossword · Classic Mini"
        difficulty={puzzle.difficulty}
        timer={fmt(seconds)}
        backHref="/puzzles/crossword"
      />
      
      <div className="game-wrapper crossword-theme">
        <div className="question-col">
          {/* Main Grid View */}
          <div className="crossword-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <div 
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${rowsCount}, 1fr)`,
                gridTemplateColumns: `repeat(${colsCount}, 1fr)`,
                gap: '2px',
                background: '#4b5563',
                padding: '4px',
                borderRadius: '8px',
                width: 'fit-content',
                maxWidth: '100%',
                aspectRatio: '1',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              {userGrid.map((rowArr, r) => 
                rowArr.map((cellVal, c) => {
                  const isBlocker = cellVal === null
                  const cellNum = getCellNumber(r, c)
                  const isWrong = wrongCells[r][c]
                  const isActive = activeCell?.row === r && activeCell?.col === c

                  if (isBlocker) {
                    return (
                      <div 
                        key={`${r}-${c}`} 
                        style={{
                          background: '#1f2937',
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px'
                        }}
                      />
                    )
                  }

                  return (
                    <div 
                      key={`${r}-${c}`}
                      style={{
                        position: 'relative',
                        width: '60px',
                        height: '60px',
                        background: isWrong ? '#fee2e2' : isActive ? '#eff6ff' : '#ffffff',
                        borderRadius: '4px',
                        border: isWrong ? '2px solid #ef4444' : isActive ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        boxSizing: 'border-box'
                      }}
                      onClick={() => {
                        cellRefs.current[r]?.[c]?.focus()
                      }}
                    >
                      {cellNum && (
                        <span 
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#4b5563',
                            userSelect: 'none'
                          }}
                        >
                          {cellNum}
                        </span>
                      )}
                      <input
                        ref={el => {
                          if (!cellRefs.current[r]) cellRefs.current[r] = []
                          if (el) cellRefs.current[r][c] = el
                        }}
                        type="text"
                        value={cellVal}
                        disabled={gameOver}
                        onChange={e => handleCellChange(r, c, e.target.value)}
                        onKeyDown={e => handleKeyDown(r, c, e)}
                        onFocus={() => setActiveCell({ row: r, col: c })}
                        onBlur={() => setActiveCell(null)}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          textAlign: 'center',
                          fontSize: '20px',
                          fontWeight: '700',
                          color: isWrong ? '#ef4444' : '#1f2937',
                          paddingTop: cellNum ? '12px' : '0'
                        }}
                      />
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '16px 0' }}>
            {!gameOver && (
              <>
                <button
                  type="button"
                  onClick={checkSolution}
                  className="btn-primary"
                  style={{ padding: '8px 24px' }}
                >
                  Check Grid
                </button>
                <button
                  type="button"
                  onClick={handleReveal}
                  className="btn-ghost"
                  style={{ border: '1px solid var(--gray-300)' }}
                >
                  Reveal Solution
                </button>
              </>
            )}
          </div>

          {/* Status Message */}
          {gameOver && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
              <div 
                className={solved ? 'result-box correct-result' : 'result-box wrong-result'}
                style={{ width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div className={solved ? 'result-icon correct-icon' : 'result-icon wrong-icon'}>
                  {solved ? '✓' : '✖'}
                </div>
                <div>
                  <div className="result-title">{solved ? 'Solved!' : 'Solution Revealed'}</div>
                  <div className="result-explanation">
                    {solved ? `Congratulations! You solved the crossword in ${fmt(seconds)}.` : 'Here is the correct solution.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clues List */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginTop: '32px',
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '6px' }}>
                Across
              </h3>
              <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clues.across.map(clue => (
                  <li 
                    key={`across-${clue.number}`}
                    style={{ fontSize: '14px', color: '#374151', padding: '4px 0' }}
                  >
                    <strong>{clue.number}.</strong> {clue.clue}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '6px' }}>
                Down
              </h3>
              <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clues.down.map(clue => (
                  <li 
                    key={`down-${clue.number}`}
                    style={{ fontSize: '14px', color: '#374151', padding: '4px 0' }}
                  >
                    <strong>{clue.number}.</strong> {clue.clue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-col">
          <div className="sidebar-card">
            <div className="sidebar-card-title">Timer</div>
            <div className="score-display">
              <div className="score-number">{fmt(seconds)}</div>
              <div className="score-label">Time elapsed</div>
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
