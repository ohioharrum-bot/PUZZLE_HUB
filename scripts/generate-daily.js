require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const Groq = require('groq-sdk');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;

// --- GENERATORS ---

function generateSudoku() {
  const solution = [
    [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9]
  ];
  const puzzle = solution.map(r => [...r]);
  let removed = 0;
  while (removed < 45) {
    const r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
  }
  return { puzzle, solution };
}

function generateWordSearch(words) {
  const size = 12;
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  const placed = [];
  const directions = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];

  for (let word of words) {
    word = word.toUpperCase();
    let tries = 0;
    while (tries < 100) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const startR = Math.floor(Math.random() * size), startC = Math.floor(Math.random() * size);
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

// --- AI CALLS ---

async function generateAITheme() {
  if (!groq) return null;
  try {
    console.log('🤖 AI Theme generation...');
    const prompt = 'Pick a theme (e.g. Space, Ocean, Coding) and 8 related words. JSON: { "theme": "...", "words": ["...", ...] }';
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error('❌ AI Theme failed:', e.message);
    return null;
  }
}

async function generateAIRiddle() {
  if (!groq) return null;
  try {
    console.log('🤖 AI Riddle generation...');
    const prompt = 'Generate a riddle with 4 options. JSON: { "question": "...", "answer": "...", "hint": "...", "options": ["...", ...] }';
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error('❌ AI Riddle failed:', e.message);
    return null;
  }
}

async function generateAIWord() {
  if (!groq) return null;
  try {
    console.log('🤖 AI Word Guesser generation...');
    const prompt = 'Provide a common 5-letter word and a theme hint. JSON: { "word": "...", "hint": "..." }';
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error('❌ AI Word failed:', e.message);
    return null;
  }
}

const JIGSAW_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
];

// --- RUNNER ---

function formatDateFriendly(dateString) {
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateString;
  const [year, month, day] = parts;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[month - 1] || '';
  
  let suffix = 'th';
  if (day < 11 || day > 13) {
    switch (day % 10) {
      case 1: suffix = 'st'; break;
      case 2: suffix = 'nd'; break;
      case 3: suffix = 'rd'; break;
    }
  }
  return `${monthName} ${day}${suffix}, ${year}`;
}

async function run() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const dateFriendly = formatDateFriendly(today);
  console.log(`🚀 Generating daily puzzles for ${today} (${dateFriendly})...`);

  // Delete existing puzzles for today to refresh them
  console.log('🧹 Clearing existing puzzles for today...');
  await supabase.from('puzzles').delete().eq('daily_date', today);

  const puzzles = [];

  // 1. Sudoku
  const sudokuData = generateSudoku();
  puzzles.push({
    id: uuidv4(),
    title: `Daily Sudoku - ${dateFriendly}`,
    type: 'sudoku',
    difficulty: 'medium',
    puzzle_data: sudokuData,
    solution_data: { solution: sudokuData.solution },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 2. Word Search
  const theme = await generateAITheme();
  const words = theme ? theme.words : ['PUZZLE', 'GAME', 'CODE', 'REACT', 'NEXT', 'LOGIC', 'SUDOKU', 'WORD'];
  const wsData = generateWordSearch(words);
  puzzles.push({
    id: uuidv4(),
    title: theme ? `Daily Word Search: ${theme.theme} - ${dateFriendly}` : `Daily Word Search - ${dateFriendly}`,
    type: 'wordsearch',
    difficulty: 'medium',
    puzzle_data: wsData,
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 3. Logic
  const riddle = await generateAIRiddle();
  puzzles.push({
    id: uuidv4(),
    title: `Daily Riddle - ${dateFriendly}`,
    type: 'logic',
    difficulty: 'medium',
    puzzle_data: riddle || { 
      question: "What has keys but no locks?", 
      answer: "A piano", 
      hint: "Music", 
      options: ["Piano", "Map", "Whisper", "Wind"] 
    },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 4. Word Guesser
  const aiWord = await generateAIWord();
  puzzles.push({
    id: uuidv4(),
    title: aiWord ? `Daily Word Guesser: ${aiWord.hint} - ${dateFriendly}` : `Daily Word Guesser - ${dateFriendly}`,
    type: 'wordle',
    difficulty: 'medium',
    puzzle_data: { solution: aiWord ? aiWord.word.toUpperCase() : 'CLOUD' },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 5. Jigsaw
  const imageUrl = JIGSAW_IMAGES[Math.floor(Math.random() * JIGSAW_IMAGES.length)];
  puzzles.push({
    id: uuidv4(),
    title: `Daily Jigsaw - ${dateFriendly}`,
    type: 'jigsaw',
    difficulty: 'medium',
    puzzle_data: { image_url: imageUrl, pieces: 24 },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  console.log('📤 Uploading to Supabase...');
  const { error } = await supabase.from('puzzles').insert(puzzles);
  
  if (error) {
    console.error('❌ Upload failed:', error.message);
  } else {
    console.log('✅ Successfully generated and stored daily puzzles!');
  }
}

run();
