require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const Groq = require('groq-sdk');
const { v4: uuidv4 } = require('uuid');

// Since we can't easily import the TS generators into this node script without transpilation,
// and we don't have ts-node, we'll use simplified versions or copy the logic.
// For now, let's use the Logic and WordSearch from seed-puzzles.js as fallbacks.

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

async function generateAITheme() {
  if (!groq) return null;
  try {
    const prompt = 'Pick a fun theme for a word search. JSON: { "theme": "...", "words": ["WORD1", "WORD2", "WORD3", "WORD4", "WORD5", "WORD6"] }';
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error('AI Theme failed:', e.message);
    return null;
  }
}

async function generateAIRiddle() {
  if (!groq) return null;
  try {
    const prompt = 'Generate a riddle. JSON: { "question": "...", "answer": "...", "hint": "...", "options": ["...", "...", "...", "..."] }';
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error('AI Riddle failed:', e.message);
    return null;
  }
}

async function run() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`🚀 Generating daily puzzles for ${today}...`);

  const puzzles = [];

  // 1. Sudoku (Static Seed for simplicity)
  puzzles.push({
    id: uuidv4(),
    title: `Daily Sudoku - ${today}`,
    type: 'sudoku',
    difficulty: 'medium',
    puzzle_data: { puzzle: Array(9).fill(Array(9).fill(0)), solution: Array(9).fill(Array(9).fill(1)) },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 2. Word Search (AI or Fallback)
  const theme = await generateAITheme();
  puzzles.push({
    id: uuidv4(),
    title: theme ? `Daily Word Search: ${theme.theme} - ${today}` : `Daily Word Search - ${today}`,
    type: 'wordsearch',
    difficulty: 'medium',
    puzzle_data: { grid: [], words: theme ? theme.words : ['PUZZLE', 'GAME', 'CODE'], solution: [] },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 3. Logic (AI or Fallback)
  const riddle = await generateAIRiddle();
  puzzles.push({
    id: uuidv4(),
    title: `Daily Riddle - ${today}`,
    type: 'logic',
    difficulty: 'medium',
    puzzle_data: riddle || { question: "What has keys but no locks?", answer: "A piano", hint: "Music", options: ["Piano", "Map", "Whisper", "Wind"] },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  console.log('📤 Uploading to Supabase...');
  const { data, error } = await supabase.from('puzzles').insert(puzzles);
  
  if (error) {
    if (error.code === '23505') {
      console.log('✨ Daily puzzles already exist for today.');
    } else {
      console.error('❌ Upload failed:', error.message);
    }
  } else {
    console.log('✅ Successfully generated and stored daily puzzles!');
  }
}

run();
