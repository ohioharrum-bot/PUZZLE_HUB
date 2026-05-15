'use client'
import { useState, useEffect } from 'react'
import { JigsawPuzzleData, Puzzle } from '@/types/puzzle'
import Image from 'next/image'

export default function JigsawGame({ puzzle }: { puzzle: Puzzle }) {
  const data = puzzle.puzzle_data as JigsawPuzzleData
  const piecesCount = data.pieces ?? 16
  const [solvedPieces, setSolvedPieces] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const handlePieceClick = async (index: number) => {
    if (solved || solvedPieces.includes(index)) return
    
    // In this basic version, you must click pieces in any order to "assemble" them
    const newSolved = [...solvedPieces, index]
    setSolvedPieces(newSolved)

    if (newSolved.length === piecesCount) {
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
    <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm overflow-hidden">
      <div className="mb-6 flex items-center justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Time {fmt(seconds)}
        </div>
        <div className="flex gap-4">
          <span>{piecesCount} Pieces</span>
          <span className="text-orange-600">{puzzle.difficulty}</span>
        </div>
      </div>

      <div className="relative group">
        {data.image_url ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-black/5">
            <Image
              src={data.image_url}
              alt={puzzle.title}
              width={1200}
              height={800}
              unoptimized
              className={`w-full transition-all duration-700 ${solved ? 'opacity-100 scale-100' : 'opacity-40 scale-105 grayscale'}`}
            />
            {!solved && (
              <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-8 gap-1 p-2">
                {Array.from({ length: piecesCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePieceClick(i)}
                    className={`aspect-square rounded-lg border-2 border-white/20 transition-all ${
                      solvedPieces.includes(i) 
                      ? 'bg-transparent border-transparent' 
                      : 'bg-black/20 hover:bg-black/40 backdrop-blur-sm'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: piecesCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => handlePieceClick(i)}
                className={`aspect-square rounded-2xl border-4 transition-all flex items-center justify-center text-xl font-black ${
                  solvedPieces.includes(i)
                  ? 'bg-green-500 border-green-600 text-white scale-95 opacity-50'
                  : 'bg-indigo-500 border-indigo-600 text-white hover:scale-105 hover:rotate-3 shadow-lg'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {solved && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-10 py-6 rounded-[40px] shadow-2xl border-4 border-orange-500 scale-110 animate-in fade-in zoom-in duration-500">
              <div className="text-center">
                <p className="text-orange-500 font-black text-sm uppercase tracking-[0.3em] mb-1">Masterpiece!</p>
                <h3 className="text-3xl font-black text-black">SOLVED in {fmt(seconds)}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => { setSolvedPieces([]); setSolved(false); setSeconds(0) }}
          className="px-8 py-3 bg-gray-50 hover:bg-black hover:text-white rounded-2xl text-sm font-bold transition-all"
        >
          Reset Puzzle
        </button>
      </div>
    </div>
  )
}
