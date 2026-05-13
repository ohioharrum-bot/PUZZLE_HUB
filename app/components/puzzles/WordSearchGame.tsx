'use client'
import { useState } from 'react'
import { Puzzle, WordSearchPuzzleData } from '@/types/puzzle'

export default function WordSearchGame({ puzzle }: { puzzle: Puzzle }) {
  const { grid, words, solution } = puzzle.puzzle_data as WordSearchPuzzleData
  const [found, setFound] = useState<string[]>([])
  const [selecting, setSelecting] = useState<[number,number][]>([])
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)

  const getCell = (r: number, c: number) => `${r}-${c}`

  const startSelect = (r: number, c: number) => {
    setIsSelecting(true)
    setSelecting([[r, c]])
  }

  const continueSelect = (r: number, c: number) => {
    if (!isSelecting) return
    setSelecting(prev => {
      if (prev.some(([pr, pc]) => pr === r && pc === c)) return prev
      return [...prev, [r, c]]
    })
  }

  const endSelect = () => {
    setIsSelecting(false)
    const selectedWord = selecting.map(([r, c]) => grid[r][c]).join('')
    const reversed = selectedWord.split('').reverse().join('')

    for (const sol of solution) {
      if ((sol.word === selectedWord || sol.word === reversed) && !found.includes(sol.word)) {
        const cells = new Set(highlighted)
        selecting.forEach(([r, c]) => cells.add(getCell(r, c)))
        setHighlighted(cells)
        setFound(f => [...f, sol.word])
        break
      }
    }
    setSelecting([])
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-stretch">
      <div className="w-full overflow-x-auto">
        <div
          className="select-none min-w-[20rem] border-2 border-gray-300 rounded-lg overflow-hidden"
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
                    className={[
                      'w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-mono font-bold cursor-pointer border border-gray-100',
                      isHighlighted ? 'bg-green-300 text-green-900' : '',
                      isSelecting_ ? 'bg-indigo-300 text-indigo-900' : '',
                      !isHighlighted && !isSelecting_ ? 'hover:bg-gray-100' : '',
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[150px] w-full max-w-sm">
        <h3 className="font-bold text-gray-700 mb-3">Find these words:</h3>
        <ul className="space-y-1">
          {words.map((word: string) => (
            <li key={word} className={`text-sm font-mono font-semibold ${found.includes(word) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {found.includes(word) ? 'Found' : 'Find'} {word}
            </li>
          ))}
        </ul>
        {found.length === words.length && (
          <p className="mt-4 text-green-600 font-bold">All found</p>
        )}
      </div>
    </div>
  )
}
