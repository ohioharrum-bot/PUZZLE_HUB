import JigsawGame from '@/components/puzzles/JigsawGame'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound } from 'next/navigation'

export default async function JigsawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'jigsaw')
  if (!puzzle) notFound()
  return <JigsawGame puzzle={puzzle} />
}
