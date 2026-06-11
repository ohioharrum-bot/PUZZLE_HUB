'use client'
import { useState, useEffect } from 'react'
import { Puzzle, WordSearchPuzzleData } from '@/types/puzzle'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

export default function WordSearchGame({ puzzle }: { puzzle: Puzzle }) {
  const { grid, words, solution } = puzzle.puzzle_data as WordSearchPuzzleData
  const [found, setFound] = useState<string[]>([])
  const [startPos, setStartPos] = useState<[number, number] | null>(null)
  const [selecting, setSelecting] = useState<[number,number][]>([])
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [solved, setSolved] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  const getCell = (r: number, c: number) => `${r}-${c}`

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
  }, [puzzle.id, puzzle.completed, words, solution])

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const startSelect = (r: number, c: number) => {
    if (solved) return
    setIsSelecting(true)
    setStartPos([r, c])
    setSelecting([[r, c]])
  }

  const continueSelect = (r: number, c: number) => {
    if (!isSelecting || solved || !startPos) return
    
    const [sr, sc] = startPos
    const dr = r - sr
    const dc = c - sc
    const absDr = Math.abs(dr)
    const absDc = Math.abs(dc)

    // Only allow horizontal, vertical, or 45-degree diagonal
    if (dr === 0 || dc === 0 || absDr === absDc) {
      const steps = Math.max(absDr, absDc)
      const stepR = dr === 0 ? 0 : dr / absDr
      const stepC = dc === 0 ? 0 : dc / absDc
      
      const newSelecting: [number, number][] = []
      for (let i = 0; i <= steps; i++) {
        newSelecting.push([sr + i * stepR, sc + i * stepC])
      }
      setSelecting(newSelecting)
    }
  }

  const endSelect = async () => {
    if (!isSelecting || solved) return
    setIsSelecting(false)
    setStartPos(null)
    
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
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-black/70 bg-white/60 px-3 py-1 rounded-full border border-black/5 shadow-sm">{fmt(seconds)}</span>
          <span className="capitalize px-3 py-1 rounded-full border border-black/10 bg-white/60 text-xs font-medium text-black/50">{puzzle.difficulty}</span>
        </div>
        {solved && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            ✓ Solved!
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Grid Container */}
        <div className="w-full flex flex-col items-center lg:items-start gap-2">
          <div className="w-full overflow-x-auto pb-4 scrollbar-hide flex justify-center lg:justify-start">
            <div
              className="select-none inline-block border-2 border-black/10 rounded-2xl overflow-hidden shadow-sm bg-white touch-none"
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
                        onTouchStart={(e) => {
                          e.preventDefault()
                          startSelect(r, c)
                        }}
                        onTouchMove={(e) => {
                          const touch = e.touches[0]
                          const el = document.elementFromPoint(touch.clientX, touch.clientY)
                          const rAttr = el?.getAttribute('data-r')
                          const cAttr = el?.getAttribute('data-c')
                          if (rAttr !== null && cAttr !== null && rAttr !== undefined && cAttr !== undefined) {
                            continueSelect(parseInt(rAttr), parseInt(cAttr))
                          }
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault()
                          endSelect()
                        }}
                        data-r={r}
                        data-c={c}
                        className={[
                          'w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-mono font-bold cursor-pointer border border-black/[0.03] transition-all touch-none',
                          isHighlighted ? 'bg-green-100 text-green-700' : '',
                          isSelecting_ ? 'bg-indigo-500 text-white z-10 scale-105 rounded-sm shadow-md' : '',
                          !isHighlighted && !isSelecting_ ? 'hover:bg-indigo-50 text-slate-900 bg-white/70' : '',
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
          <p className="text-[10px] text-black/30 font-medium uppercase tracking-wider block lg:hidden">↔ Scroll to see full grid</p>
        </div>

        {/* Word List Container */}
        <div className="bg-white/80 border border-black/10 rounded-[28px] p-6 w-full lg:max-w-[300px] shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-black mb-4 flex items-center justify-between">
            <span className="text-lg tracking-tight">Word List</span>
            <span className="text-xs font-medium bg-black/5 px-2 py-1 rounded-full text-black/40">{found.length}/{words.length}</span>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {words.map((word: string) => (
              <div 
                key={word} 
                className={`text-xs sm:text-sm font-mono p-2.5 rounded-xl border-2 transition-all flex items-center justify-center lg:justify-start ${
                  found.includes(word) 
                  ? 'bg-green-50 border-green-200 text-green-700 line-through opacity-50' 
                  : 'bg-white border-black/5 text-black/70 shadow-sm'
                }`}
              >
                {word}
              </div>
            ))}
          </div>
          {solved && (
            <div className="mt-6 p-4 bg-green-500 text-white rounded-[20px] text-center font-bold text-sm shadow-lg shadow-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
              🎉 Puzzle Complete!
              <div className="text-xs font-normal opacity-90 mt-1">Found all {words.length} words in {fmt(seconds)}</div>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-black/30 text-center lg:text-left">Drag over letters to select a word</p>
    </div>
  )
}
