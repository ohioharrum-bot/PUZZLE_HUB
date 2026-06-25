import WordSearchGame from '@/components/puzzles/WordSearchGame'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound } from 'next/navigation'

export default async function WordSearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'wordsearch')
  if (!puzzle) notFound()
  return <WordSearchGame puzzle={puzzle} />
}
