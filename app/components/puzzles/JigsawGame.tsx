'use client'
import { useState, useEffect } from 'react'
import { JigsawPuzzleData, Puzzle } from '@/types/puzzle'
import Image from 'next/image'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

export default function JigsawGame({ puzzle }: { puzzle: Puzzle }) {
  const data = puzzle.puzzle_data as JigsawPuzzleData
  const piecesCount = data.pieces ?? 16
  const cols = piecesCount === 16 ? 4 : 8
  const rows = piecesCount / cols

  const [positions, setPositions] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [hasSaved, setHasSaved] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  // Shuffle pieces
  useEffect(() => {
    const shuffle = (array: number[]) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }
    
    // Check if already solved in localStorage
    const storageKey = `puzzle-completed-${puzzle.id}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const { seconds: storedSeconds } = JSON.parse(stored)
        setSeconds(storedSeconds)
        setSolved(true)
        setHasSaved(true)
        setPositions(Array.from({ length: piecesCount }, (_, i) => i))
        return
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }

    setPositions(shuffle(Array.from({ length: piecesCount }, (_, i) => i)))
  }, [puzzle.id, piecesCount])

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const handleSlotClick = (slotIdx: number) => {
    if (solved) return

    if (selectedSlot === null) {
      setSelectedSlot(slotIdx)
    } else if (selectedSlot === slotIdx) {
      setSelectedSlot(null)
    } else {
      // Swap pieces
      const newPositions = [...positions]
      const temp = newPositions[selectedSlot]
      newPositions[selectedSlot] = newPositions[slotIdx]
      newPositions[slotIdx] = temp
      setPositions(newPositions)
      setSelectedSlot(null)

      // Check if solved
      const isSolved = newPositions.every((p, i) => p === i)
      if (isSolved) {
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
    }
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="bg-white/80 border border-black/10 rounded-[32px] p-4 sm:p-8 shadow-sm overflow-hidden backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          {fmt(seconds)}
        </div>
        <div className="flex gap-4">
          <span>{piecesCount} Pieces</span>
          <span className="text-orange-600/70">{puzzle.difficulty}</span>
        </div>
      </div>

      <div className="relative group mx-auto max-w-full">
        {data.image_url ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-black/10 aspect-[3/2] bg-gray-100 shadow-inner">
            {/* Background ghost image */}
            <Image
              src={data.image_url}
              alt={puzzle.title}
              fill
              unoptimized
              className={`object-cover transition-all duration-700 ${solved ? 'opacity-100' : 'opacity-10 grayscale'}`}
            />
            
            {!solved && (
              <div 
                className={`absolute inset-0 grid gap-0.5 p-0.5`}
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)` 
                }}
              >
                {positions.map((pieceIdx, slotIdx) => {
                  const pieceCol = pieceIdx % cols
                  const pieceRow = Math.floor(pieceIdx / cols)
                  const bgX = (pieceCol / (cols - 1)) * 100
                  const bgY = (pieceRow / (rows - 1)) * 100
                  const isSelected = selectedSlot === slotIdx

                  return (
                    <button
                      key={slotIdx}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`relative border transition-all duration-200 rounded-sm shadow-sm ${
                        isSelected 
                          ? 'z-20 border-indigo-500 ring-4 ring-indigo-500/20 scale-105 shadow-xl' 
                          : 'border-white/10 hover:border-white/40'
                      }`}
                      style={{
                        backgroundImage: `url(${data.image_url})`,
                        backgroundSize: `${cols * 100}% ${rows * 100}%`,
                        backgroundPosition: `${bgX}% ${bgY}%`,
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {positions.map((pieceIdx, slotIdx) => {
              const isSelected = selectedSlot === slotIdx
              return (
                <button
                  key={slotIdx}
                  onClick={() => handleSlotClick(slotIdx)}
                  className={`aspect-square rounded-2xl border-2 sm:border-4 transition-all flex items-center justify-center text-lg sm:text-xl font-black ${
                    pieceIdx === slotIdx && solved
                      ? 'bg-green-500 border-green-600 text-white scale-95 opacity-50'
                      : isSelected
                        ? 'bg-indigo-600 border-indigo-700 text-white scale-110 z-10 shadow-xl'
                        : 'bg-indigo-500 border-indigo-600 text-white shadow-lg'
                  }`}
                >
                  {pieceIdx + 1}
                </button>
              )
            })}
          </div>
        )}

        {solved && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-10 py-6 rounded-[40px] shadow-2xl border-4 border-orange-500 scale-110 animate-in fade-in zoom-in duration-500">
              <div className="text-center">
                <p className="text-orange-500 font-black text-sm uppercase tracking-[0.3em] mb-1">Masterpiece!</p>
                <h3 className="text-3xl font-black text-black">SOLVED!</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => { 
            const arr = Array.from({ length: piecesCount }, (_, i) => i)
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]]
            }
            setPositions(arr)
            setSolved(false)
            setSeconds(0) 
            setSelectedSlot(null)
          }}
          className="px-8 py-3 bg-black/5 hover:bg-black hover:text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
        >
          Reset Puzzle
        </button>
      </div>
      <p className="text-[10px] text-black/30 font-medium uppercase tracking-wider text-center mt-4">
        Tap a piece then another to swap positions
      </p>
    </div>
  )
}
