// ── Sudoku Generator ──────────────────────────────────────────
export function generateSudoku(difficulty: 'easy' | 'medium' | 'hard') {
  const solution = solveSudoku(createEmptyGrid())
  const puzzle = removeCells(solution, difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55)
  return { puzzle, solution }
}

function createEmptyGrid(): number[][] {
  return Array(9).fill(null).map(() => Array(9).fill(0))
}

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false
  }
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (grid[boxRow + i][boxCol + j] === num) return false
  return true
}

function solveSudoku(grid: number[][]): number[][] {
  const g = grid.map(r => [...r])
  const nums = [1,2,3,4,5,6,7,8,9]
  function fill(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (g[r][c] === 0) {
          const shuffled = [...nums].sort(() => Math.random() - 0.5)
          for (const n of shuffled) {
            if (isValid(g, r, c, n)) {
              g[r][c] = n
              if (fill()) return true
              g[r][c] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }
  fill()
  return g
}

function removeCells(solution: number[][], count: number): number[][] {
  const puzzle = solution.map(r => [...r])
  let removed = 0
  while (removed < count) {
    const r = Math.floor(Math.random() * 9)
    const c = Math.floor(Math.random() * 9)
    if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++ }
  }
  return puzzle
}

// ── Word Search Generator ──────────────────────────────────────
const WORD_BANKS = {
  easy:   ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'FISH', 'BIRD', 'TREE'],
  medium: ['PYTHON', 'ROCKET', 'PLANET', 'BRIDGE', 'CASTLE', 'GARDEN'],
  hard:   ['ALGORITHM', 'KEYBOARD', 'UNIVERSE', 'CHOCOLATE', 'ADVENTURE'],
}

export function generateWordSearch(difficulty: 'easy' | 'medium' | 'hard', customWords?: string[]) {
  const size = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 15
  const words = customWords || WORD_BANKS[difficulty]
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''))
  const placed: { word: string; positions: [number,number][] }[] = []

  const directions = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]]

  for (const word of words) {
    let tries = 0
    while (tries < 100) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)]
      const startR = Math.floor(Math.random() * size)
      const startC = Math.floor(Math.random() * size)
      const positions: [number,number][] = []
      let fits = true

      for (let i = 0; i < word.length; i++) {
        const r = startR + dr * i, c = startC + dc * i
        if (r < 0 || r >= size || c < 0 || c >= size) { fits = false; break }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) { fits = false; break }
        positions.push([r, c])
      }

      if (fits) {
        positions.forEach(([r,c], i) => { grid[r][c] = word[i] })
        placed.push({ word, positions })
        break
      }
      tries++
    }
  }

  // Fill empty cells
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)]

  return { grid, words: placed.map(p => p.word), solution: placed }
}

// ── Logic Puzzle Generator ────────────────────────────────────
export function generateLogicPuzzle(difficulty: 'easy' | 'medium' | 'hard') {
  const puzzles = {
    easy: [
      {
        question: "There are 3 boxes. One has apples, one has oranges, one has both. All labels are wrong. You can pick one fruit from one box. Which box do you pick from to figure out all labels?",
        answer: "The box labeled 'Both'",
        hint: "Since all labels are wrong, the 'Both' box must contain only one fruit.",
        options: ["Box labeled 'Apples'", "Box labeled 'Oranges'", "Box labeled 'Both'", "Any box works"]
      },
      {
        question: "A rooster lays an egg on top of a barn roof. Which way does it roll?",
        answer: "Roosters don't lay eggs",
        hint: "Think about what a rooster actually is.",
        options: ["Left", "Right", "Doesn't roll – it slides", "Roosters don't lay eggs"]
      },
    ],
    medium: [
      {
        question: "You have two ropes, each burns in exactly 1 hour (not uniformly). How do you measure 45 minutes?",
        answer: "Light rope 1 from both ends, rope 2 from one end simultaneously. When rope 1 burns out (30 min), light the other end of rope 2. When rope 2 burns out = 45 min.",
        hint: "Lighting from both ends halves the burn time.",
        options: [
          "Light both from one end, extinguish one at 45 min",
          "Light rope 1 from both ends, rope 2 from one end. When rope 1 dies, light rope 2's other end",
          "Fold the rope to measure half",
          "You cannot measure 45 minutes"
        ]
      },
    ],
    hard: [
      {
        question: "100 prisoners each have a number 1–100 on their back. They can see others' but not their own. Each must guess their own number. What strategy guarantees at least 1 correct guess?",
        answer: "Each prisoner guesses the number that would make the sum of all visible numbers divisible by 100.",
        hint: "Think about modular arithmetic and coordination.",
        options: [
          "All guess randomly",
          "Each guesses the highest visible number",
          "Each guesses to make visible sum divisible by 100",
          "First prisoner announces sum, rest calculate"
        ]
      },
    ]
  }

  const pool = puzzles[difficulty]
  return pool[Math.floor(Math.random() * pool.length)]
}