import SudokuGame from '@/components/puzzles/SudokuGame'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound } from 'next/navigation'

export default async function SudokuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'sudoku')
  if (!puzzle) notFound()
  return <SudokuGame puzzle={puzzle} />
}
