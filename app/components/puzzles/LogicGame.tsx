'use client'
import { useState, useEffect } from 'react'
import { LogicPuzzleData, Puzzle } from '@/types/puzzle'

export default function LogicGame({ puzzle }: { puzzle: Puzzle }) {
  const { question, answer, hint, options } = puzzle.puzzle_data as LogicPuzzleData
  const [selected, setSelected] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const isCorrect = selected === answer

  const handleSelect = async (opt: string) => {
    setSelected(opt)
    setRevealed(true)
    if (opt === answer && !solved) {
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
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6 space-y-5">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Time {fmt(seconds)}</span>
        <span className="capitalize px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">{puzzle.difficulty}</span>
      </div>

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-gray-800 font-medium leading-relaxed">{question}</p>
      </div>

      <div className="grid gap-3">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={revealed}
            className={[
              'text-left px-4 py-3 rounded-xl border-2 transition-all font-medium',
              revealed && opt === answer ? 'border-green-500 bg-green-50 text-green-800' : '',
              revealed && opt === selected && opt !== answer ? 'border-red-400 bg-red-50 text-red-700' : '',
              !revealed ? 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer' : '',
            ].join(' ')}
          >
            <span className="mr-2 text-xs uppercase tracking-wide text-gray-400">
              {revealed ? (opt === answer ? 'Correct' : opt === selected ? 'Selected' : 'Option') : 'Option'}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {revealed && (
        <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
          <p className="font-semibold">{isCorrect ? 'Correct' : 'Not quite'}</p>
          <p className="text-sm mt-1"><strong>Answer:</strong> {answer}</p>
          {isCorrect && <p className="text-xs mt-2 opacity-70">Solved in {fmt(seconds)}</p>}
        </div>
      )}

      {!revealed && (
        <button onClick={() => setShowHint(!showHint)} className="text-sm text-indigo-500 hover:underline">
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      )}
      {showHint && !revealed && (
        <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-yellow-800">
          Hint: {hint}
        </p>
      )}
    </div>
  )
}
