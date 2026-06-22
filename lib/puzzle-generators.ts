import { createSeededRandom, pickDailyIndex, seededShuffle } from './daily-seed'

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
export const WORD_BANKS = {
  easy: [
    ['CAT', 'DOG', 'BIRD', 'FISH', 'FROG', 'LION', 'TIGER', 'BEAR', 'WOLF', 'DUCK', 'DEER', 'GOAT', 'LAMB', 'PIG'],
    ['SUN', 'MOON', 'STAR', 'SKY', 'RAIN', 'SNOW', 'WIND', 'CLOUD', 'HEAT', 'COLD', 'MIST', 'FOG', 'STORM'],
    ['RED', 'BLUE', 'GOLD', 'PINK', 'GREY', 'TEAL', 'ROSE', 'LIME', 'NAVY', 'AQUA', 'JADE', 'PLUM', 'RUBY']
  ],
  medium: [
    ['PYTHON', 'JAVA', 'KOTLIN', 'SWIFT', 'RUST', 'RUBY', 'GO', 'PHP', 'HTML', 'CSS', 'REACT', 'NODE', 'SQL', 'DOCKER', 'LINUX'],
    ['ROCKET', 'PLANET', 'GALAXY', 'COMET', 'ORBIT', 'SOLAR', 'NASA', 'SPACE', 'METEOR', 'ASTRO', 'COSMOS', 'HUBBLE', 'LUNAR', 'VENUS', 'MARS'],
    ['COFFEE', 'TEA', 'LATTE', 'JUICE', 'WATER', 'MILK', 'SODA', 'CHAI', 'MOCHA', 'BREW', 'MATCHA', 'SHAKE', 'SMOOTHIE', 'COCOA']
  ],
  hard: [
    ['ALGORITHM', 'DATABASE', 'FRONTEND', 'BACKEND', 'NETWORK', 'SECURITY', 'ENCRYPTION', 'FRAMEWORK', 'INTERFACE', 'PROTOCOL', 'COMPILER'],
    ['UNIVERSE', 'ASTRONOMY', 'TELESCOPE', 'ASTEROID', 'NEBULA', 'COSMOS', 'QUASAR', 'GRAVITY', 'ECLIPSE', 'STARLIGHT', 'INFINITY'],
    ['ADVENTURE', 'MOUNTAIN', 'OCEAN', 'FOREST', 'DESERT', 'ISLAND', 'VOLCANO', 'CANYON', 'GLACIER', 'SAVANNA', 'PLATEAU', 'VALLEY']
  ],
}

export function generateWordSearch(
  difficulty: 'easy' | 'medium' | 'hard',
  customWords?: string[],
  dateSeed?: string,
  avoidBankIndex?: number
) {
  const size = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 15
  const rand = dateSeed ? createSeededRandom(dateSeed) : Math.random

  let words: string[]
  if (customWords) {
    words = customWords
  } else {
    const banks = WORD_BANKS[difficulty]
    const bankIndex = dateSeed
      ? pickDailyIndex(banks.length, dateSeed, avoidBankIndex)
      : Math.floor(rand() * banks.length)
    const selectedBank = banks[bankIndex]
    const count = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 8
    words = seededShuffle(selectedBank, rand).slice(0, count)
  }

  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''))
  const placed: { word: string; positions: [number,number][] }[] = []

  const directions = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]]

  for (const word of words) {
    let tries = 0
    while (tries < 100) {
      const [dr, dc] = directions[Math.floor(rand() * directions.length)]
      const startR = Math.floor(rand() * size)
      const startC = Math.floor(rand() * size)
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
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(rand() * 26)]

  return { grid, words: placed.map(p => p.word), solution: placed }
}

// ── Logic Puzzle Generator ────────────────────────────────────
export const LOGIC_PUZZLE_POOLS = {
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
    {
      question: "What gets wetter the more it dries?",
      answer: "A towel",
      hint: "You use it after a shower.",
      options: ["A sponge", "A towel", "The sun", "Sand"]
    },
    {
      question: "I speak without a mouth and hear without ears. What am I?",
      answer: "An echo",
      hint: "You hear it in mountains and empty halls.",
      options: ["A ghost", "An echo", "The wind", "A shadow"]
    },
    {
      question: "A man pushes his car to a hotel and realizes he's bankrupt. What game is he playing?",
      answer: "Monopoly",
      hint: "It's a board game with properties and hotels.",
      options: ["Chess", "Monopoly", "Clue", "Risk"]
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
    {
      question: "A man lives on the 20th floor. Every day he takes the elevator to the ground floor. On rainy days he takes the elevator back up, but on sunny days he walks up from the 10th floor. Why?",
      answer: "He is too short to reach the button for the 20th floor",
      hint: "Think about what changes on rainy days that helps him reach higher buttons.",
      options: [
        "He exercises on sunny days",
        "He is too short to reach the button for the 20th floor",
        "The elevator is broken on sunny days",
        "He meets a friend on the 10th floor"
      ]
    },
    {
      question: "You are in a room with two doors. One leads to freedom, one to a trap. Two guards: one always lies, one always tells the truth. You may ask one guard one question. What do you ask?",
      answer: "What would the other guard say is the door to freedom?",
      hint: "A double negative reveals the truth.",
      options: [
        "Which door would you say leads to freedom?",
        "What would the other guard say is the door to freedom?",
        "Is the left door safe?",
        "Are you the truth-teller?"
      ]
    },
    {
      question: "A farmer has 17 sheep. All but 9 die. How many are left?",
      answer: "9",
      hint: "Read 'all but 9' carefully.",
      options: ["8", "9", "17", "0"]
    },
    {
      question: "What can travel around the world while staying in a corner?",
      answer: "A stamp",
      hint: "You find it on letters and postcards.",
      options: ["A coin", "A stamp", "A map", "A passport"]
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
    {
      question: "You have 12 identical-looking balls. One is heavier or lighter. Using a balance scale only 3 times, can you find the odd ball and whether it's heavier or lighter?",
      answer: "Yes — divide into three groups of four and compare systematically",
      hint: "Split into groups of four, not two.",
      options: [
        "No, you need at least 4 weighings",
        "Yes — divide into three groups of four and compare systematically",
        "Yes — but only if the odd ball is heavier",
        "Only with 4 weighings"
      ]
    },
    {
      question: "Three gods A, B, and C are called True, False, and Random. True always tells truth, False always lies, Random answers randomly. You may ask three yes/no questions. Can you identify each god?",
      answer: "Yes — use nested questions to isolate Random first",
      hint: "Complex questions can force consistent answers even from Random.",
      options: [
        "No — Random makes it impossible",
        "Yes — use nested questions to isolate Random first",
        "Yes — but only with four questions",
        "Only if you know which is Random"
      ]
    },
    {
      question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
      answer: "7.5 degrees",
      hint: "The hour hand moves between numbers, not just at 3.",
      options: ["0 degrees", "7.5 degrees", "15 degrees", "90 degrees"]
    },
  ]
}

export function getLogicPuzzleBankIndex(difficulty: 'easy' | 'medium' | 'hard', dateSeed: string, avoidBankIndex?: number): number {
  return pickDailyIndex(LOGIC_PUZZLE_POOLS[difficulty].length, dateSeed, avoidBankIndex)
}

export function generateLogicPuzzle(
  difficulty: 'easy' | 'medium' | 'hard',
  dateSeed?: string,
  avoidQuestion?: string
) {
  const pool = LOGIC_PUZZLE_POOLS[difficulty]
  const avoidIndex = avoidQuestion ? pool.findIndex(p => p.question === avoidQuestion) : undefined
  const index = dateSeed
    ? pickDailyIndex(pool.length, dateSeed, avoidIndex !== undefined && avoidIndex >= 0 ? avoidIndex : undefined)
    : Math.floor(Math.random() * pool.length)
  return pool[index]
}