'use client'
import { JigsawPuzzleData, Puzzle } from '@/types/puzzle'
import Image from 'next/image'

export default function JigsawGame({ puzzle }: { puzzle: Puzzle }) {
  const data = puzzle.puzzle_data as JigsawPuzzleData
  const pieces = data.pieces ?? 16

  if (!data.image_url) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
          <span className="capitalize">{puzzle.difficulty}</span>
          <span>{pieces} pieces</span>
        </div>
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-lg border border-gray-200 sm:grid-cols-4">
          {Array.from({ length: pieces }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={[
                'aspect-square border border-white/60 text-sm font-bold text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                index % 4 === 0 ? 'bg-indigo-500' : '',
                index % 4 === 1 ? 'bg-emerald-500' : '',
                index % 4 === 2 ? 'bg-amber-500' : '',
                index % 4 === 3 ? 'bg-rose-500' : '',
              ].join(' ')}
              aria-label={`Puzzle piece ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
        <span className="capitalize">{puzzle.difficulty}</span>
        <span>{pieces} pieces</span>
      </div>
      {/* The saved image is shown until drag-and-drop piece splitting is added. */}
      <Image
        src={data.image_url}
        alt={puzzle.title}
        width={1200}
        height={800}
        unoptimized
        className="w-full rounded-lg border border-gray-100 object-cover"
      />
    </div>
  )
}
