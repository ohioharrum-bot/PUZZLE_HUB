import WordGuesserGame from '@/components/puzzles/WordGuesserGame'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound } from 'next/navigation'

export default async function WordGuesserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'wordle')
  if (!puzzle) notFound()
  return <WordGuesserGame puzzle={puzzle} />
}
