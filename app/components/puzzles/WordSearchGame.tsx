'use client'
import { useState, useEffect } from 'react'
import { Puzzle, WordSearchPuzzleData } from '@/types/puzzle'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { GameNav } from '@/components/layout/Header'

const TIME_LIMIT_SECONDS = 600

export default function WordSearchGame({ puzzle }: { puzzle: Puzzle }) {
  const { grid, words, solution } = puzzle.puzzle_data as WordSearchPuzzleData
  const [found, setFound] = useState<string[]>([])
  const [startPos, setStartPos] = useState<[number, number] | null>(null)
  const [selecting, setSelecting] = useState<[number,number][]>([])
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const [unfoundHighlighted, setUnfoundHighlighted] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [failReason, setFailReason] = useState<'timeout' | 'giveup' | null>(null)
  const [hasSaved, setHasSaved] = useState(false)

  const getCell = (r: number, c: number) => `${r}-${c}`
  const gameOver = solved || failed

  const revealUnfoundWords = () => {
    const cells = new Set<string>()
    solution.forEach(sol => {
      if (!found.includes(sol.word)) {
        sol.positions.forEach(([r, c]) => cells.add(getCell(r, c)))
      }
    })
    setUnfoundHighlighted(cells)
  }

  const endGameAsFailed = (reason: 'timeout' | 'giveup') => {
    if (gameOver) return
    setFailReason(reason)
    setFailed(true)
    revealUnfoundWords()
  }

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
    if (gameOver) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [gameOver])

  useEffect(() => {
    if (!gameOver && seconds >= TIME_LIMIT_SECONDS) {
      endGameAsFailed('timeout')
    }
  }, [seconds, gameOver])

  const startSelect = (r: number, c: number) => {
    if (gameOver) return
    setIsSelecting(true)
    setStartPos([r, c])
    setSelecting([[r, c]])
  }

  const continueSelect = (r: number, c: number) => {
    if (!isSelecting || gameOver || !startPos) return
    
    const [sr, sc] = startPos
    const dr = r - sr
    const dc = c - sc
    const absDr = Math.abs(dr)
    const absDc = Math.abs(dc)

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
    if (!isSelecting || gameOver) return
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
  const timeRemaining = Math.max(0, TIME_LIMIT_SECONDS - seconds)
  const missingWords = words.filter(w => !found.includes(w))
  const cols = grid[0]?.length ?? 12
  const rows = grid.length

  return (
    <>
      <GameNav
        title={puzzle.title}
        meta={`Word Search · ${words.length} words`}
        difficulty={puzzle.difficulty}
        timer={fmt(seconds)}
        backHref="/puzzles/wordsearch"
      />
      <div className="game-wrapper game-wrapper-wordsearch">
        <div className="board-col">
          {!gameOver && (
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2 px-1 w-full">
              <span>{fmt(timeRemaining)} remaining</span>
              <button type="button" onClick={() => endGameAsFailed('giveup')} className="text-red-500 hover:underline font-semibold">
                Give up
              </button>
            </div>
          )}
          <div
            className="select-none touch-none border-2 border-black/10 rounded-2xl overflow-hidden shadow-md bg-white
              aspect-square w-full max-w-[min(100%,560px)] mx-auto
              min-h-[min(calc(100vw-2.5rem),420px)] sm:min-h-[460px]
              lg:min-h-[500px] lg:min-w-[500px] lg:max-w-none"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
            onMouseLeave={endSelect}
          >
            {grid.map((row: string[], r: number) =>
              row.map((letter: string, c: number) => {
                const key = getCell(r, c)
                const isFound = highlighted.has(key)
                const isUnfound = unfoundHighlighted.has(key)
                const isSelecting_ = selecting.some(([sr, sc]) => sr === r && sc === c)
                return (
                  <div
                    key={key}
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
                      if (rAttr != null && cAttr != null) {
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
                      'flex items-center justify-center font-mono font-bold cursor-pointer border border-black/[0.04] transition-colors touch-none',
                      'text-base sm:text-lg lg:text-xl xl:text-2xl',
                      isFound ? 'bg-green-100 text-green-700' : '',
                      isUnfound ? 'bg-orange-200 text-orange-900 ring-1 ring-inset ring-orange-400' : '',
                      isSelecting_ ? 'bg-indigo-500 text-white z-10 shadow-inner' : '',
                      !isFound && !isUnfound && !isSelecting_ ? 'hover:bg-indigo-50 text-slate-900 bg-white' : '',
                    ].join(' ')}
                  >
                    {letter}
                  </div>
                )
              })
            )}
          </div>
          <p className="text-xs text-gray-400 text-center lg:text-left w-full mt-4">Drag over letters to select a word</p>
        </div>

        <div className="sidebar-col">
          <div className="sidebar-card">
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
                    : failed
                    ? 'bg-orange-50 border-orange-300 text-orange-800 font-semibold'
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
            {failed && (
              <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-200 text-orange-900 rounded-[20px] text-center text-sm">
                <p className="font-bold mb-1">{failReason === 'giveup' ? 'You gave up' : 'Out of time!'}</p>
                <p className="text-xs opacity-80 mb-2">Unfound words are highlighted in orange on the grid.</p>
                {missingWords.length > 0 && (
                  <p className="text-xs font-medium">
                    Missing: {missingWords.join(', ')}
                  </p>
                )}
              </div>
            )}
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
