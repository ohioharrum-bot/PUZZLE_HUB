'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Puzzle, SudokuPuzzleData } from '@/types/puzzle'
import { formatTime, saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

export default function SudokuGame({ puzzle }: { puzzle: Puzzle }) {
  const puzzleData = puzzle.puzzle_data as SudokuPuzzleData
  const initialGrid: number[][] = puzzleData.puzzle
  const solution: number[][] = puzzleData.solution

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
  
  // Restore from localStorage
  useEffect(() => {
    const storageKey = `puzzle-completed-${puzzle.id}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const { seconds: storedSeconds } = JSON.parse(stored)
        setSeconds(storedSeconds)
        setSolved(true)
        setHasSaved(true)
        setGrid(solution.map(r => [...r]))
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }
  }, [puzzle.id, solution])

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

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Timer + difficulty */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-mono font-semibold text-black/70">{formatTime(seconds)}</span>
        <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs capitalize text-black/50">
          {puzzle.difficulty}
        </span>
        {solved && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            ✓ Solved!
          </span>
        )}
      </div>

      {/* Solved banner */}
      {solved && (
        <div className="w-full rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-center">
          <p className="text-lg font-semibold text-green-800">🎉 Puzzle Complete!</p>
          <p className="text-sm text-green-600">
            Finished in <span className="font-mono font-bold">{formatTime(seconds)}</span>
          </p>
          {saving && <p className="mt-1 text-xs text-green-500">Saving score…</p>}
          {!saving && <p className="mt-1 text-xs text-green-500">Score saved to leaderboard ✓</p>}
        </div>
      )}

      {/* Grid */}
      <div
        className="grid grid-cols-9 overflow-hidden rounded-2xl border-2 border-black/20 shadow-sm bg-white"
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

            const borderR = (c + 1) % 3 === 0 && c < 8
              ? 'border-r-2 border-r-black/25'
              : 'border-r border-r-black/10'
            const borderB = (r + 1) % 3 === 0 && r < 8
              ? 'border-b-2 border-b-black/25'
              : 'border-b border-b-black/10'

            return (
              <div
                key={`${r}-${c}`}
                ref={el => { cellRefs.current[r][c] = el }}
                tabIndex={isInitial || solved ? -1 : 0}
                role="gridcell"
                aria-label={`Row ${r + 1}, Column ${c + 1}`}
                onFocus={() => setSelected([r, c])}
                className={[
                  'relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-lg outline-none transition-colors select-none cursor-pointer',
                  borderR, borderB,
                  isSelected
                    ? 'bg-indigo-500 text-white font-bold'
                    : isSameBox || isSameRow || isSameCol
                      ? 'bg-indigo-50'
                      : 'bg-white/70',
                  isInitial
                    ? 'font-bold text-black/80 cursor-default'
                    : 'text-indigo-600',
                  isError && !isSelected ? 'bg-red-100 text-red-600' : '',
                  solved ? 'bg-green-50 text-green-700' : '',
                ].join(' ')}
              >
                {cell !== 0 ? (
                  cell
                ) : (
                  <div className="grid grid-cols-3 grid-rows-3 h-full w-full p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <div key={n} className="flex items-center justify-center text-[8px] leading-none text-indigo-400/80 font-medium">
                        {candidates.get(`${r}-${c}`)?.has(n) ? n : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Controls */}
      {!solved && (
        <div className="flex gap-2">
          <button
            onClick={() => setPencilMode(!pencilMode)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
              pencilMode 
                ? 'bg-indigo-500 border-indigo-600 text-white shadow-inner' 
                : 'bg-white/60 border-black/10 text-black/60 hover:bg-black/5'
            }`}
          >
            {pencilMode ? '✏️ Pencil ON' : '✏️ Pencil OFF'}
          </button>
          <button
            onClick={reset}
            className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-medium text-black/60 transition hover:bg-black/5"
          >
            🔄 Reset
          </button>
          <button
            onClick={() => {
              const newErrors = new Set<string>()
              grid.forEach((row, r) =>
                row.forEach((cell, c) => {
                  if (cell !== 0 && cell !== solution[r][c]) newErrors.add(`${r}-${c}`)
                })
              )
              setErrors(newErrors)
            }}
            className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-medium text-black/60 transition hover:bg-black/5"
          >
            ✓ Check
          </button>
        </div>
      )}

      <p className="text-xs text-black/30">Use arrow keys to navigate between cells</p>
    </div>
  )
}
