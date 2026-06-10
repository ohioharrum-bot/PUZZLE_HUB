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
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null)
  const [autoLock, setAutoLock] = useState(false)

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
        setPositions(Array.from({ length: piecesCount }, (_, i) => i))
        return
      } catch (e) {
        console.error('Failed to parse stored puzzle state', e)
      }
    }

    setPositions(shuffle(Array.from({ length: piecesCount }, (_, i) => i)))
  }, [puzzle.id, puzzle.completed, piecesCount])

  useEffect(() => {
    if (solved) return
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [solved])

  const isPieceCorrect = (slotIdx: number, currentPositions: number[]) => currentPositions[slotIdx] === slotIdx

  const handleDrop = (targetSlot: number) => {
    if (draggedSlot === null || solved) return
    
    // If target is locked, ignore
    if (autoLock && isPieceCorrect(targetSlot, positions)) {
      setDraggedSlot(null)
      return
    }

    const newPositions = [...positions]
    const temp = newPositions[draggedSlot]
    newPositions[draggedSlot] = newPositions[targetSlot]
    newPositions[targetSlot] = temp
    
    setPositions(newPositions)
    setDraggedSlot(null)

    // Check if solved
    const isSolved = newPositions.every((p, i) => p === i)
    if (isSolved) {
      setSolved(true)
      if (!hasSaved) {
        const save = async () => {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) saveProgressLocally(puzzle.id, seconds)
          try {
            await fetch('/api/scores', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ puzzle_id: puzzle.id, time_seconds: seconds })
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
                  const isLocked = autoLock && isPieceCorrect(slotIdx, positions)

                  return (
                    <div
                      key={slotIdx}
                      draggable={!isLocked}
                      onDragStart={() => setDraggedSlot(slotIdx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(slotIdx)}
                      className={`relative border transition-all duration-200 rounded-sm shadow-sm flex items-center justify-center ${
                        isLocked
                          ? 'border-green-500/50 z-0 cursor-default'
                          : 'border-white/10 hover:border-white/40 cursor-grab active:cursor-grabbing hover:z-10 hover:shadow-xl'
                      }`}
                      style={{
                        backgroundImage: `url(${data.image_url})`,
                        backgroundSize: `${cols * 100}% ${rows * 100}%`,
                        backgroundPosition: `${bgX}% ${bgY}%`,
                      }}
                    >
                      {isLocked && (
                        <div className="bg-green-500/80 text-white rounded-full p-0.5 scale-75 shadow-sm">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {positions.map((pieceIdx, slotIdx) => {
              const isLocked = autoLock && isPieceCorrect(slotIdx, positions)
              return (
                <div
                  key={slotIdx}
                  draggable={!isLocked}
                  onDragStart={() => setDraggedSlot(slotIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(slotIdx)}
                  className={`aspect-square rounded-2xl border-2 sm:border-4 transition-all flex items-center justify-center text-lg sm:text-xl font-black relative ${
                    isLocked || (pieceIdx === slotIdx && solved)
                      ? 'bg-green-500 border-green-600 text-white opacity-80 scale-95 cursor-default'
                      : 'bg-indigo-500 border-indigo-600 text-white shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 hover:rotate-2'
                  }`}
                >
                  {pieceIdx + 1}
                  {isLocked && (
                    <div className="absolute top-1 right-1 bg-white/20 rounded-full p-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {solved && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-10 py-6 rounded-[40px] shadow-2xl border-4 border-orange-500 scale-110 animate-in fade-in zoom-in duration-500">
              <div className="text-center">
                <p className="text-orange-500 font-black text-sm uppercase tracking-[0.3em] mb-1">Masterpiece!</p>
                <h3 className="text-3xl font-black text-black">SOLVED!</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setAutoLock(!autoLock)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold transition-all uppercase tracking-widest border ${
              autoLock 
                ? 'bg-green-500 border-green-600 text-white shadow-inner' 
                : 'bg-black/5 border-black/5 text-black/40 hover:bg-black/10'
            }`}
          >
            {autoLock ? '🔒 Auto-lock ON' : '🔓 Auto-lock OFF'}
          </button>
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
            }}
            className="px-5 py-2.5 bg-black/5 border border-black/5 hover:bg-black hover:text-white rounded-2xl text-[10px] font-bold transition-all uppercase tracking-widest text-black/40"
          >
            Reset
          </button>
        </div>
        <p className="text-[10px] text-black/30 font-medium uppercase tracking-wider text-center">
          Drag and drop pieces to swap them
        </p>
      </div>
    </div>
  )
}
