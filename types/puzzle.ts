export type PuzzleType = 'sudoku' | 'wordsearch' | 'jigsaw' | 'logic'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type SudokuPuzzleData = {
  puzzle: number[][]
  solution: number[][]
}

export type WordSearchPuzzleData = {
  grid: string[][]
  words: string[]
  solution: { word: string; positions: [number, number][] }[]
}

export type LogicPuzzleData = {
  question: string
  answer: string
  hint: string
  options: string[]
}

export type JigsawPuzzleData = {
  image_url?: string
  pieces?: number
}

export type PuzzleData = SudokuPuzzleData | WordSearchPuzzleData | LogicPuzzleData | JigsawPuzzleData

export interface Puzzle {
  id: string
  title: string
  type: PuzzleType
  difficulty: Difficulty
  puzzle_data: PuzzleData
  solution_data?: unknown
  thumbnail_url?: string
  is_daily: boolean
  daily_date?: string
  play_count: number
  created_at: string
}

export interface Score {
  id: string
  puzzle_id: string
  session_id: string
  time_seconds: number
  completed: boolean
  created_at: string
}
