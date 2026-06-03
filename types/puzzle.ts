export type PuzzleType = 'sudoku' | 'wordsearch' | 'jigsaw' | 'logic' | 'wordle'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type WordGuesserPuzzleData = {
  solution: string
}

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

export type PuzzleData = SudokuPuzzleData | WordSearchPuzzleData | LogicPuzzleData | JigsawPuzzleData | WordGuesserPuzzleData

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
  user_id?: string
  ip_address?: string
  time_seconds: number
  completed: boolean
  created_at: string
  profiles?: {
    username: string
  }
}
