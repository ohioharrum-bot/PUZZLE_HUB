import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import ws from 'ws';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Check:');
console.log('- URL present:', !!supabaseUrl);
console.log('- Key present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: ws
  }
});

function generateSudoku(difficulty) {
  const solution = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];
  
  const puzzle = solution.map(r => [...r]);
  const count = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
  let removed = 0;
  while (removed < count) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return { puzzle, solution };
}

function generateWordSearch(difficulty) {
  const WORD_BANKS = {
    easy: ['NEXTJS', 'REACT', 'TAILWIND', 'TYPESCRIPT', 'VERCEL', 'SUPABASE'],
    medium: ['JAVASCRIPT', 'DEVELOPER', 'FRONTEND', 'BACKEND', 'DATABASE', 'FULLSTACK'],
    hard: ['ARCHITECTURE', 'INFRASTRUCTURE', 'MICROSERVICES', 'DEPLOYMENT', 'AUTOMATION']
  };
  const size = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 15;
  const words = WORD_BANKS[difficulty];
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  const placed = [];
  const directions = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];

  for (const word of words) {
    let tries = 0;
    while (tries < 100) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);
      const positions = [];
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = startR + dr * i, c = startC + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
          fits = false; break;
        }
        positions.push([r, c]);
      }
      if (fits) {
        positions.forEach(([r,c], i) => { grid[r][c] = word[i]; });
        placed.push({ word, positions });
        break;
      }
      tries++;
    }
  }
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];
  return { grid, words: placed.map(p => p.word), solution: placed };
}

const LOGIC_PUZZLES = [
  {
    title: "The Silent Truth",
    difficulty: "easy",
    question: "What can travel around the world while staying in a corner?",
    answer: "A stamp",
    hint: "Think about letters and mail.",
    options: ["A plane", "A stamp", "A whisper", "The moon"]
  },
  {
    title: "Numerical Mystery",
    difficulty: "medium",
    question: "If 1=3, 2=3, 3=5, 4=4, 5=4, then 6=?",
    answer: "3",
    hint: "Count the letters in the words.",
    options: ["3", "4", "5", "6"]
  },
  {
    title: "The Empty Space",
    difficulty: "hard",
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "A map",
    hint: "It's a representation of the world.",
    options: ["A desert", "A dream", "A map", "A painting"]
  }
];

const JIGSAW_SAMPLES = [
  { title: "Mountain Lake", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Neon City", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Autumn Forest", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80", pieces: 16 }
];

const WORDLE_SAMPLES = [
  { title: "Ocean Mystery", difficulty: "easy", solution: "WATER" },
  { title: "Tech Term", difficulty: "medium", solution: "PIXEL" },
  { title: "Abstract Concept", difficulty: "hard", solution: "CHAOS" }
];

async function seed() {
  console.log('🚀 Starting puzzle seed...');
  const newPuzzles = [];

  const today = new Date().toISOString().split('T')[0];
  ['easy', 'medium', 'hard'].forEach((diff, i) => {
    const data = generateSudoku(diff);
    newPuzzles.push({
      id: uuidv4(),
      title: i === 0 ? `Daily Sudoku - ${today}` : `Sudoku Challenge - ${diff.charAt(0).toUpperCase() + diff.slice(1)}`,
      type: 'sudoku',
      difficulty: diff,
      puzzle_data: data,
      solution_data: { solution: data.solution },
      is_daily: i === 0,
      play_count: 0
    });
  });

  ['easy', 'medium', 'hard'].forEach((diff) => {
    const data = generateWordSearch(diff);
    newPuzzles.push({
      id: uuidv4(),
      title: `${diff.charAt(0).toUpperCase() + diff.slice(1)} Tech Search`,
      type: 'wordsearch',
      difficulty: diff,
      puzzle_data: data,
      is_daily: false,
      play_count: 0
    });
  });

  LOGIC_PUZZLES.forEach(p => {
    newPuzzles.push({
      id: uuidv4(),
      title: p.title,
      type: 'logic',
      difficulty: p.difficulty,
      puzzle_data: {
        question: p.question,
        answer: p.answer,
        hint: p.hint,
        options: p.options
      },
      is_daily: false,
      play_count: 0
    });
  });

  JIGSAW_SAMPLES.forEach((j, i) => {
    newPuzzles.push({
      id: uuidv4(),
      title: j.title,
      type: 'jigsaw',
      difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard',
      puzzle_data: {
        image_url: j.url,
        pieces: j.pieces
      },
      is_daily: false,
      play_count: 0
    });
  });

  WORDLE_SAMPLES.forEach(w => {
    newPuzzles.push({
      id: uuidv4(),
      title: w.title,
      type: 'word-guesser',
      difficulty: w.difficulty,
      puzzle_data: {
        solution: w.solution
      },
      is_daily: false,
      play_count: 0
    });
  });

  console.log(`📦 Generated ${newPuzzles.length} puzzles. Uploading to Supabase...`);

  const { error } = await supabase.from('puzzles').insert(newPuzzles);

  if (error) {
    console.error('❌ Error seeding puzzles:', error.message);
  } else {
    console.log('✅ Successfully seeded puzzles!');
  }
}

seed();
