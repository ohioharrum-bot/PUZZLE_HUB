import WordSearchGame from '@/components/puzzles/WordSearchGame'
import { getPuzzleById } from '@/lib/puzzle-data'
import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function WordSearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = await getPuzzleById(id, 'wordsearch')
  if (!puzzle) notFound()

  if (puzzle.difficulty === 'medium' || puzzle.difficulty === 'hard') {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/auth/login?message=Create a free account to play Medium and Hard puzzles')
    }
  }

  return <WordSearchGame puzzle={puzzle} />
}
