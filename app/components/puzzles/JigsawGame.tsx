'use client'
import { useState, useEffect } from 'react'
import { JigsawPuzzleData, Puzzle } from '@/types/puzzle'
import Image from 'next/image'
import { saveProgressLocally } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { GameNav } from '@/components/layout/Header'

export default function JigsawGame({ puzzle }: { puzzle: Puzzle }) {
  const data = puzzle.puzzle_data as JigsawPuzzleData
  const piecesCount = data.pieces ?? 16
  const cols = piecesCount === 16 ? 4 : 8
  const rows = piecesCount / cols

  const [positions, setPositions] = useState<number[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [hasSaved, setHasSaved] = useState(false)
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

  const handleSlotClick = (slotIdx: number) => {
    if (solved) return
    
    // If target is locked, ignore
    if (autoLock && isPieceCorrect(slotIdx, positions)) {
      setSelectedSlot(null)
      return
    }

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
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const placedCount = positions.filter((p, i) => p === i).length
  const remainingCount = piecesCount - placedCount
  const progressPct = Math.round((placedCount / piecesCount) * 100)

  const shufflePieces = () => {
    const arr = Array.from({ length: piecesCount }, (_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setPositions(arr)
    setSelectedSlot(null)
    setSolved(false)
    setSeconds(0)
  }

  return (
    <div className="jigsaw-theme">
      <GameNav
        title={`${puzzle.title} – Jigsaw`}
        meta={`Jigsaw · ${puzzle.difficulty} · ${piecesCount} pieces`}
        difficulty={puzzle.difficulty}
        timer={fmt(seconds)}
        backHref="/puzzles/jigsaw"
        dark
      />
      <div className="game-wrapper game-wrapper-jigsaw">
        <div className="pieces-panel">
          <div className="panel-title">Pieces Remaining</div>
          <div className="pieces-grid">
            {positions.map((pieceIdx, slotIdx) => {
              const isPlaced = pieceIdx === slotIdx
              if (isPlaced) return null
              const colorClass = `piece-${(pieceIdx % 9) + 1}`
              return (
                <div
                  key={slotIdx}
                  className={`piece ${colorClass}${selectedSlot === slotIdx ? ' dragging' : ''}`}
                  onClick={() => handleSlotClick(slotIdx)}
                >
                  <span className="piece-number">{pieceIdx + 1}</span>
                </div>
              )
            })}
          </div>
          <div className="pieces-info">
            <div className="pieces-info-row">
              <span>Remaining</span>
              <span className="pieces-info-val">{remainingCount} / {piecesCount}</span>
            </div>
            <div className="pieces-info-row">
              <span>Placed</span>
              <span className="pieces-info-val">{placedCount} / {piecesCount}</span>
            </div>
            <div className="pieces-info-row">
              <span>Difficulty</span>
              <span className="pieces-info-val capitalize">{puzzle.difficulty}</span>
            </div>
          </div>
        </div>

        <div className="canvas-area">
          <div className="canvas-bg" />
          {data.image_url ? (
            <div
              className="jigsaw-board"
              style={{
                backgroundImage: solved ? `url(${data.image_url})` : undefined,
                backgroundSize: 'cover',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {positions.map((pieceIdx, slotIdx) => {
                const pieceCol = pieceIdx % cols
                const pieceRow = Math.floor(pieceIdx / cols)
                const bgX = cols > 1 ? (pieceCol / (cols - 1)) * 100 : 0
                const bgY = rows > 1 ? (pieceRow / (rows - 1)) * 100 : 0
                const isPlaced = pieceIdx === slotIdx
                const isSelected = selectedSlot === slotIdx

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={[
                      'board-cell',
                      isPlaced ? 'filled' : 'drop-target',
                      isSelected ? 'drop-target' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {!solved && (
                      <div
                        className="board-cell-piece"
                        style={data.image_url ? {
                          backgroundImage: `url(${data.image_url})`,
                          backgroundSize: `${cols * 100}% ${rows * 100}%`,
                          backgroundPosition: `${bgX}% ${bgY}%`,
                        } : { background: `hsl(${(pieceIdx * 40) % 360}, 70%, 50%)` }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className="jigsaw-board"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {positions.map((pieceIdx, slotIdx) => {
                const isPlaced = pieceIdx === slotIdx
                const isSelected = selectedSlot === slotIdx
                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={[
                      'board-cell',
                      isPlaced ? 'filled' : 'drop-target',
                      isSelected ? 'drop-target' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <div
                      className="board-cell-piece"
                      style={{ background: `hsl(${(pieceIdx * 40) % 360}, 70%, 50%)` }}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {solved && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md px-10 py-6 rounded-2xl shadow-2xl border-4 border-orange-500">
                <p className="text-orange-500 font-black text-sm uppercase tracking-widest mb-1 text-center">Masterpiece!</p>
                <h3 className="text-3xl font-black text-black text-center">SOLVED!</h3>
              </div>
            </div>
          )}

          <div className="canvas-controls">
            <button type="button" className="canvas-btn" onClick={() => setAutoLock(!autoLock)}>
              {autoLock ? '🔒 Auto-lock ON' : '🔓 Auto-lock OFF'}
            </button>
            <button type="button" className="canvas-btn" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000' }} onClick={shufflePieces}>
              Shuffle Pieces
            </button>
          </div>
        </div>

        <div className="right-panel">
          <div className="sidebar-card">
            <div className="sidebar-card-title">Progress</div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="progress-stats">
              <div className="prog-stat">
                <div className="prog-stat-num">{placedCount}</div>
                <div className="prog-stat-label">Placed</div>
              </div>
              <div className="prog-stat">
                <div className="prog-stat-num">{remainingCount}</div>
                <div className="prog-stat-label">Left</div>
              </div>
              <div className="prog-stat">
                <div className="prog-stat-num">{progressPct}%</div>
                <div className="prog-stat-label">Done</div>
              </div>
            </div>
          </div>

          {data.image_url && (
            <div className="sidebar-card">
              <div className="sidebar-card-title">Reference Image</div>
              <div className="reference-img relative overflow-hidden">
                <Image src={data.image_url} alt={puzzle.title} fill unoptimized className="object-cover" />
              </div>
            </div>
          )}

          <div className="ad-slot">
            <div className="ad-label">Advertisement</div>
            <span className="ad-size">300 × 200</span>
          </div>
        </div>
      </div>
    </div>
  )
}
