'use client'
import { useState } from 'react'
import { generateSudoku, generateWordSearch, generateLogicPuzzle } from '@/lib/puzzle-generators'
import type { Difficulty, Puzzle, PuzzleData, PuzzleType } from '@/types/puzzle'

type AdminForm = {
  title: string
  type: PuzzleType
  difficulty: Difficulty
  is_daily: boolean
  imageUrl?: string
  pieces?: number
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [form, setForm] = useState<AdminForm>({ title: '', type: 'sudoku', difficulty: 'easy', is_daily: false, imageUrl: '', pieces: 16 })
  const [status, setStatus] = useState('')
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [loading, setLoading] = useState(false)

  const loadPuzzles = async () => {
    setLoading(true)
    const res = await fetch('/api/puzzles')
    if (res.ok) {
      setPuzzles(await res.json())
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    setStatus('Creating...')
    let puzzle_data: PuzzleData = {}
    let solution_data: unknown = null

    if (form.type === 'sudoku') {
      const { puzzle, solution } = generateSudoku(form.difficulty)
      puzzle_data = { puzzle, solution }
      solution_data = { solution }
    } else if (form.type === 'wordsearch') {
      puzzle_data = generateWordSearch(form.difficulty)
    } else if (form.type === 'logic') {
      puzzle_data = generateLogicPuzzle(form.difficulty)
    } else if (form.type === 'jigsaw') {
      puzzle_data = {
        image_url: form.imageUrl || '',
        pieces: form.pieces || 16,
      }
    }

    const res = await fetch('/api/puzzles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ title: form.title, type: form.type, difficulty: form.difficulty, is_daily: form.is_daily, puzzle_data, solution_data }),
    })

    const data = await res.json()
    setStatus(res.ok ? `Created: ${data.id}` : `Error: ${data.error}`)
    if (res.ok) {
      loadPuzzles()
    }
  }

  if (!authed) return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <input type="password" value={secret} onChange={e => setSecret(e.target.value)}
        placeholder="Admin secret" className="w-full border rounded-lg px-3 py-2 mb-3" />
      <button 
        onClick={() => {
          setAuthed(true)
          loadPuzzles()
        }}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg"
      >
        Enter
      </button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Add Puzzle</h1>
      <div className="space-y-4">
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Puzzle title" className="w-full border rounded-lg px-3 py-2" />
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PuzzleType }))}
          className="w-full border rounded-lg px-3 py-2">
          <option value="sudoku">Sudoku</option>
          <option value="wordsearch">Word Search</option>
          <option value="logic">Logic Puzzle</option>
          <option value="jigsaw">Jigsaw (manual upload)</option>
        </select>
        <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Difficulty }))}
          className="w-full border rounded-lg px-3 py-2">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_daily}
            onChange={e => setForm(f => ({ ...f, is_daily: e.target.checked }))} />
          Mark as Daily Puzzle
        </label>

        {form.type === 'jigsaw' && (
          <div className="space-y-3">
            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="Jigsaw image URL" className="w-full border rounded-lg px-3 py-2" />
            <input type="number" min={4} max={100} value={form.pieces}
              onChange={e => setForm(f => ({ ...f, pieces: Number(e.target.value) }))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Piece count" />
          </div>
        )}

        <button onClick={handleCreate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold">
          Generate & Save Puzzle
        </button>
        {status && <p className="text-sm text-gray-600">{status}</p>}
      </div>
      <div className="mt-8 rounded-2xl border border-black/10 bg-slate-50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Supabase puzzles</h2>
          <button onClick={loadPuzzles} className="text-sm text-indigo-600 hover:underline">
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading puzzles…</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Loaded {puzzles.length} puzzle(s) from Supabase.</p>
            <div className="grid gap-2 text-sm text-gray-700">
              {puzzles.slice(0, 10).map(p => (
                <div key={p.id} className="rounded-xl bg-white p-3 border border-black/5">
                  <div className="font-semibold text-black">{p.title}</div>
                  <div className="text-xs text-black/45">{p.type} • {p.difficulty} • {p.is_daily ? 'Daily' : 'Standard'}</div>
                </div>
              ))}
            </div>
            {puzzles.length > 10 && <p className="text-xs text-gray-500">Showing 10 of {puzzles.length} puzzles.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
