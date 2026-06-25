import LogicGame from '@/components/puzzles/LogicGame'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound } from 'next/navigation'

export default async function LogicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'logic')
  if (!puzzle) notFound()
  return <LogicGame puzzle={puzzle} />
}
