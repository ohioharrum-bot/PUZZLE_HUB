'use client'
import { useState, useEffect, useRef } from 'react'
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
  const inputs = useRef<(HTMLInputElement | null)[][]>(Array(9).fill(null).map(() => Array(9).fill(null)))

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const handleInput = async (r: number, c: number, val: string) => {
    if (initialGrid[r][c] !== 0 || solved) return
    
    // Get only the last character if multiple characters are somehow present
    const lastChar = val.slice(-1)
    const num = parseInt(lastChar) || 0
    
    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = num
    setGrid(newGrid)

    const newErrors = new Set(errors)
    if (num !== 0 && solution[r][c] !== num) newErrors.add(`${r}-${c}`)
    else newErrors.delete(`${r}-${c}`)
    setErrors(newErrors)

    // Check solved
    const complete = newGrid.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]))
    if (complete && !solved) {
      setSolved(true)
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
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Time {fmt(seconds)}
        </div>
        <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
          {puzzle.difficulty}
        </div>
      </div>

      <div className="relative w-full max-w-[min(100%,450px)] mx-auto p-1 bg-gray-900 rounded-2xl shadow-2xl border-4 border-gray-900 overflow-hidden">
        <div className="grid grid-cols-9 bg-gray-900 gap-[1px]">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isInitial = initialGrid[r][c] !== 0
              const isSelected = selected?.[0] === r && selected?.[1] === c
              const isError = errors.has(`${r}-${c}`)
              
              // Borders for 3x3 subgrids
              const borderRight = (c + 1) % 3 === 0 && c < 8 ? 'mr-[2px]' : ''
              const borderBottom = (r + 1) % 3 === 0 && r < 8 ? 'mb-[2px]' : ''
              
              return (
                <div 
                  key={`${r}-${c}`} 
                  className={`aspect-square relative bg-white ${borderRight} ${borderBottom} transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}
                >
                  <input
                    ref={el => { if (inputs.current) inputs.current[r][c] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={cell || ''}
                    readOnly={isInitial || solved}
                    onFocus={() => setSelected([r, c])}
                    onChange={e => handleInput(r, c, e.target.value)}
                    onKeyDown={e => {
                      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        e.preventDefault()
                        let nr = r
                        let nc = c
                        if (e.key === 'ArrowUp') nr = Math.max(0, r - 1)
                        if (e.key === 'ArrowDown') nr = Math.min(8, r + 1)
                        if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1)
                        if (e.key === 'ArrowRight') nc = Math.min(8, c + 1)
                        inputs.current[nr][nc]?.focus()
                      } else if (e.key === 'Backspace' || e.key === 'Delete') {
                        handleInput(r, c, '0')
                      }
                    }}
                    className={[
                      'absolute inset-0 w-full h-full text-center text-xl sm:text-2xl font-medium outline-none transition-all',
                      isSelected ? 'bg-indigo-100/50 scale-105 z-10' : '',
                      isInitial ? 'bg-gray-100/50 font-black text-black' : 'text-indigo-600',
                      isError ? 'bg-red-50 text-red-600' : '',
                      solved ? 'bg-green-50 text-green-700 font-bold' : '',
                    ].join(' ')}
                  />
                </div>
              )
            })
          )}
        </div>
        
        {solved && (
          <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-white px-8 py-4 rounded-3xl shadow-2xl border-4 border-green-500 animate-bounce">
              <span className="text-2xl font-black text-green-600">PUZZLE SOLVED!</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => { 
            setGrid(initialGrid.map(r => [...r])); 
            setErrors(new Set()); 
            setSolved(false); 
            setSeconds(0) 
          }}
          className="px-6 py-3 bg-white border-2 border-gray-200 hover:border-black rounded-2xl text-sm font-bold text-gray-700 transition-all hover:shadow-lg"
        >
          Reset Board
        </button>
      </div>
    </div>
  )
}
