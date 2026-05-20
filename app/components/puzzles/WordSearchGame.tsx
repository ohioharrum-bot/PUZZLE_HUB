'use client'
import { useState, useEffect } from 'react'
import { Puzzle, WordSearchPuzzleData } from '@/types/puzzle'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

export default function WordSearchGame({ puzzle }: { puzzle: Puzzle }) {
  const { grid, words, solution } = puzzle.puzzle_data as WordSearchPuzzleData
  const [found, setFound] = useState<string[]>([])
  const [selecting, setSelecting] = useState<[number,number][]>([])
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [solved, setSolved] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  const getCell = (r: number, c: number) => `${r}-${c}`

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
        setFound(words)
        
        const allCells = new Set<string>()
        solution.forEach(sol => {
          sol.positions.forEach(([r, c]) => allCells.add(getCell(r, c)))
        })
        setHighlighted(allCells)
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }
  }, [puzzle.id, words, solution])

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const startSelect = (r: number, c: number) => {
    if (solved) return
    setIsSelecting(true)
    setSelecting([[r, c]])
  }

  const continueSelect = (r: number, c: number) => {
    if (!isSelecting || solved) return
    setSelecting(prev => {
      if (prev.some(([pr, pc]) => pr === r && pc === c)) return prev
      return [...prev, [r, c]]
    })
  }

  const endSelect = async () => {
    if (!isSelecting || solved) return
    setIsSelecting(false)
    const selectedWord = selecting.map(([r, c]) => grid[r][c]).join('')
    const reversed = selectedWord.split('').reverse().join('')

    for (const sol of solution) {
      if ((sol.word === selectedWord || sol.word === reversed) && !found.includes(sol.word)) {
        const cells = new Set(highlighted)
        selecting.forEach(([r, c]) => cells.add(getCell(r, c)))
        setHighlighted(cells)
        const newFound = [...found, sol.word]
        setFound(newFound)
        
        if (newFound.length === words.length) {
          setSolved(true)
          if (!hasSaved) {
            const save = async () => {
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
                setHasSaved(true)
              } catch (e) {
                console.error('❌ Failed to submit score:', e)
              }
            }
            save()
          }
        }
        break
      }
    }
    setSelecting([])
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>Time {fmt(seconds)}</span>
        <span className="capitalize px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">{puzzle.difficulty}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full overflow-x-auto pb-4 lg:pb-0">
          <div
            className="select-none inline-block min-w-max border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white"
            onMouseLeave={endSelect}
          >
            {grid.map((row: string[], r: number) => (
              <div key={r} className="flex">
                {row.map((letter: string, c: number) => {
                  const key = getCell(r, c)
                  const isHighlighted = highlighted.has(key)
                  const isSelecting_ = selecting.some(([sr, sc]) => sr === r && sc === c)
                  return (
                    <div
                      key={c}
                      onMouseDown={() => startSelect(r, c)}
                      onMouseEnter={() => continueSelect(r, c)}
                      onMouseUp={endSelect}
                      onTouchStart={() => startSelect(r, c)}
                      onTouchMove={(e) => {
                        const touch = e.touches[0]
                        const el = document.elementFromPoint(touch.clientX, touch.clientY)
                        if (el && el.getAttribute('data-r')) {
                          continueSelect(parseInt(el.getAttribute('data-r')!), parseInt(el.getAttribute('data-c')!))
                        }
                      }}
                      onTouchEnd={endSelect}
                      data-r={r}
                      data-c={c}
                      className={[
                        'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-mono font-bold cursor-pointer border border-gray-50 transition-colors',
                        isHighlighted ? 'bg-green-100 text-green-700' : '',
                        isSelecting_ ? 'bg-indigo-100 text-indigo-700' : '',
                        !isHighlighted && !isSelecting_ ? 'hover:bg-gray-50 text-gray-700' : '',
                      ].join(' ')}
                    >
                      {letter}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-5 w-full lg:max-w-[280px] shadow-sm backdrop-blur">
          <h3 className="font-semibold text-black mb-4 flex items-center justify-between">
            <span>Word List</span>
            <span className="text-xs font-normal text-black/40">{found.length}/{words.length} found</span>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {words.map((word: string) => (
              <div 
                key={word} 
                className={`text-xs sm:text-sm font-mono p-2 rounded-lg border transition-all ${
                  found.includes(word) 
                  ? 'bg-green-50 border-green-200 text-green-700 line-through opacity-60' 
                  : 'bg-gray-50 border-gray-100 text-gray-600'
                }`}
              >
                {word}
              </div>
            ))}
          </div>
          {found.length === words.length && (
            <div className="mt-4 p-3 bg-green-500 text-white rounded-xl text-center font-bold text-sm animate-bounce">
              Puzzle Complete in {fmt(seconds)}!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
