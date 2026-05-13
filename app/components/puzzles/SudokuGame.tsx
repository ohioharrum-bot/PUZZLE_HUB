'use client'
import { useState, useEffect } from 'react'
import { Puzzle, SudokuPuzzleData } from '@/types/puzzle'

export default function SudokuGame({ puzzle }: { puzzle: Puzzle }) {
  const puzzleData = puzzle.puzzle_data as SudokuPuzzleData
  const initialGrid: number[][] = puzzleData.puzzle
  const solution: number[][] = puzzleData.solution
  const [grid, setGrid] = useState<number[][]>(initialGrid.map(r => [...r]))
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [solved, setSolved] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const handleInput = (r: number, c: number, val: string) => {
    if (initialGrid[r][c] !== 0) return
    const num = parseInt(val) || 0
    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = num
    setGrid(newGrid)

    const newErrors = new Set(errors)
    if (num !== 0 && solution[r][c] !== num) newErrors.add(`${r}-${c}`)
    else newErrors.delete(`${r}-${c}`)
    setErrors(newErrors)

    // Check solved
    const complete = newGrid.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]))
    if (complete) setSolved(true)
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>Time {fmt(seconds)}</span>
        <span className="capitalize px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">{puzzle.difficulty}</span>
      </div>

      {solved && (
        <div className="bg-green-100 text-green-700 rounded-xl px-6 py-3 font-semibold text-lg">
          Solved in {fmt(seconds)}
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-3xl">
        <div className="min-w-[22.5rem] grid grid-cols-9 border-2 border-gray-800">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isInitial = initialGrid[r][c] !== 0
              const isSelected = selected?.[0] === r && selected?.[1] === c
              const isError = errors.has(`${r}-${c}`)
              const borderRight = (c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-r-gray-800' : 'border-r border-r-gray-300'
              const borderBottom = (r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-b-gray-800' : 'border-b border-b-gray-300'
              return (
                <input
                  key={`${r}-${c}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={cell || ''}
                readOnly={isInitial}
                onFocus={() => setSelected([r, c])}
                onChange={e => handleInput(r, c, e.target.value)}
                className={[
                  'h-9 w-9 sm:h-10 sm:w-10 text-center text-sm sm:text-base font-medium outline-none',
                  borderRight, borderBottom,
                  isSelected ? 'bg-indigo-100' : '',
                  isInitial ? 'bg-gray-50 font-bold text-gray-800' : 'text-indigo-700',
                  isError ? 'bg-red-100 text-red-600' : '',
                ].join(' ')}
              />
            )
          })
        )}
        </div>
      </div>

      <button
        onClick={() => { setGrid(initialGrid.map(r => [...r])); setErrors(new Set()); setSolved(false); setSeconds(0) }}
        className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
      >
        Reset
      </button>
    </div>
  )
}
