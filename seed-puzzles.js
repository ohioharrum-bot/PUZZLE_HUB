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

function generateWordSearch(difficulty, words) {
  const size = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 15;
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  const placed = [];
  const directions = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];

  for (let word of words) {
    word = word.toUpperCase();
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
  // Easy
  {
    title: "Apples & Oranges",
    difficulty: "easy",
    question: "There are 3 boxes. One has apples, one has oranges, one has both. All labels are wrong. You can pick one fruit from one box. Which box do you pick from to figure out all labels?",
    answer: "The box labeled 'Both'",
    hint: "Since all labels are wrong, the 'Both' box must contain only one fruit.",
    options: ["Box labeled 'Apples'", "Box labeled 'Oranges'", "Box labeled 'Both'", "Any box works"]
  },
  {
    title: "Rooster Egg",
    difficulty: "easy",
    question: "A rooster lays an egg on top of a barn roof. Which way does it roll?",
    answer: "Roosters don't lay eggs",
    hint: "Think about what a rooster actually is.",
    options: ["Left", "Right", "Doesn't roll – it slides", "Roosters don't lay eggs"]
  },
  {
    title: "The Wet Towel",
    difficulty: "easy",
    question: "What gets wetter the more it dries?",
    answer: "A towel",
    hint: "You use it after a shower.",
    options: ["A sponge", "A towel", "The sun", "Sand"]
  },
  {
    title: "Silent Whisper",
    difficulty: "easy",
    question: "I speak without a mouth and hear without ears. What am I?",
    answer: "An echo",
    hint: "You hear it in mountains and empty halls.",
    options: ["A ghost", "An echo", "The wind", "A shadow"]
  },
  {
    title: "The Board Game",
    difficulty: "easy",
    question: "A man pushes his car to a hotel and realizes he's bankrupt. What game is he playing?",
    answer: "Monopoly",
    hint: "It's a board game with properties and hotels.",
    options: ["Chess", "Monopoly", "Clue", "Risk"]
  },
  {
    title: "Hands of Time",
    difficulty: "easy",
    question: "What has hands but cannot clap?",
    answer: "A clock",
    hint: "It is used to tell time.",
    options: ["A clock", "A glove", "A tree", "A crab"]
  },
  {
    title: "The More You Take",
    difficulty: "easy",
    question: "The more of them you take, the more you leave behind. What are they?",
    answer: "Footsteps",
    hint: "Think about walking.",
    options: ["Footsteps", "Seconds", "Memories", "Breaths"]
  },
  {
    title: "What Has One Eye",
    difficulty: "easy",
    question: "What has one eye but cannot see?",
    answer: "A needle",
    hint: "It is used in sewing.",
    options: ["A needle", "A storm", "A potato", "A lock"]
  },
  {
    title: "What Has a Head and Tail",
    difficulty: "easy",
    question: "What has a head and a tail but no body?",
    answer: "A coin",
    hint: "You toss it to make a decision.",
    options: ["A coin", "A snake", "A kite", "A shadow"]
  },
  {
    title: "Headless Neck",
    difficulty: "easy",
    question: "What has a neck but no head?",
    answer: "A bottle",
    hint: "It holds liquids.",
    options: ["A bottle", "A shirt", "A guitar", "A violin"]
  },
  {
    title: "Up and Never Down",
    difficulty: "easy",
    question: "What goes up but never comes down?",
    answer: "Your age",
    hint: "It increases every year.",
    options: ["Your age", "A balloon", "The temperature", "Smoke"]
  },
  {
    title: "Keys but No Locks",
    difficulty: "easy",
    question: "What has keys but no locks, space but no room, and you can enter but can't go outside?",
    answer: "A keyboard",
    hint: "You are using it right now.",
    options: ["A keyboard", "A piano", "A map", "A prison"]
  },
  {
    title: "Belongs To You",
    difficulty: "easy",
    question: "What belongs to you, but other people use it more than you do?",
    answer: "Your name",
    hint: "It is how people call you.",
    options: ["Your name", "Your phone", "Your money", "Your car"]
  },
  {
    title: "Catch but Not Throw",
    difficulty: "easy",
    question: "What can you catch but not throw?",
    answer: "A cold",
    hint: "It makes you sneeze.",
    options: ["A cold", "A ball", "A shadow", "A secret"]
  },
  {
    title: "Friday Before Thursday",
    difficulty: "easy",
    question: "Where does Friday come before Thursday?",
    answer: "In the dictionary",
    hint: "Alphabetical order matters here.",
    options: ["In the dictionary", "In a leap year", "In outer space", "On a calendar"]
  },
  // Medium
  {
    title: "Burning Ropes",
    difficulty: "medium",
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
    title: "Elevator Floor",
    difficulty: "medium",
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
    title: "Two Guards",
    difficulty: "medium",
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
    title: "Seventeen Sheep",
    difficulty: "medium",
    question: "A farmer has 17 sheep. All but 9 die. How many are left?",
    answer: "9",
    hint: "Read 'all but 9' carefully.",
    options: ["8", "9", "17", "0"]
  },
  {
    title: "Corner Traveler",
    difficulty: "medium",
    question: "What can travel around the world while staying in a corner?",
    answer: "A stamp",
    hint: "You find it on letters and postcards.",
    options: ["A coin", "A stamp", "A map", "A passport"]
  },
  {
    title: "Fragile Whisper",
    difficulty: "medium",
    question: "What is so fragile that saying its name breaks it?",
    answer: "Silence",
    hint: "Think about quietness.",
    options: ["Glass", "A secret", "Silence", "An egg"]
  },
  {
    title: "Mary's Father",
    difficulty: "medium",
    question: "Mary's father has five daughters: Nana, Nene, Nini, Nono, and who?",
    answer: "Mary",
    hint: "Re-read the first word of the riddle.",
    options: ["Nunu", "Mary", "Nana", "None of the above"]
  },
  {
    title: "The River Crossing",
    difficulty: "medium",
    question: "A man has to get a fox, a goose, and a bag of beans across a river. He can only carry one at a time. If left alone, the fox eats the goose, or the goose eats the beans. How does he cross?",
    answer: "Take goose first, return empty. Take fox, return with goose. Take beans, return empty. Take goose.",
    hint: "You sometimes have to bring something back.",
    options: [
      "Take goose first, return empty. Take fox, return with goose. Take beans, return empty. Take goose.",
      "Take fox, return empty. Take goose, return empty. Take beans.",
      "Take beans, return empty. Take goose, return empty. Take fox.",
      "It is impossible to cross safely"
    ]
  },
  {
    title: "The Red House",
    difficulty: "medium",
    question: "The red house is made of red bricks, the blue house is made of blue bricks. What is the greenhouse made of?",
    answer: "Glass",
    hint: "Think about where plants grow.",
    options: ["Green bricks", "Glass", "Wood", "Leaves"]
  },
  {
    title: "Three Light Switches",
    difficulty: "medium",
    question: "There are three light switches outside a closed room. Inside is a single light bulb. You can only enter the room once. How do you find which switch controls the bulb?",
    answer: "Turn switch 1 on for 10 min, turn it off, turn switch 2 on, and enter the room. If bulb is on, it is switch 2. If off but warm, it is switch 1. If off and cold, it is switch 3.",
    hint: "Bulbs generate heat when left on.",
    options: [
      "Turn switch 1 on for 10 min, turn off, turn 2 on, enter. Bulb on = 2, warm = 1, cold = 3.",
      "Flip all switches quickly and enter",
      "Leave switch 1 and 2 on, enter",
      "You cannot determine it in one visit"
    ]
  },
  {
    title: "Brothers and Sisters",
    difficulty: "medium",
    question: "A boy has as many sisters as brothers, but each sister has only half as many sisters as brothers. How many brothers and sisters are in the family?",
    answer: "4 brothers and 3 sisters",
    hint: "Think about the total number of siblings.",
    options: ["3 brothers and 2 sisters", "4 brothers and 3 sisters", "2 brothers and 1 sister", "5 brothers and 4 sisters"]
  },
  {
    title: "The Barber of Seville",
    difficulty: "medium",
    question: "In Seville, there is a barber who shaves all men, and only those men, who do not shave themselves. Does the barber shave himself?",
    answer: "It is a logical paradox",
    hint: "If he shaves himself, he shouldn't. If he doesn't, he must.",
    options: ["Yes, he shaves himself", "No, he does not shave himself", "It is a logical paradox", "Only on weekends"]
  },
  // Hard
  {
    title: "100 Prisoners",
    difficulty: "hard",
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
    title: "Odd Ball Scale",
    difficulty: "hard",
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
    title: "Three Gods Riddle",
    difficulty: "hard",
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
    title: "Hand Angle",
    difficulty: "hard",
    question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
    answer: "7.5 degrees",
    hint: "The hour hand moves between numbers, not just at 3.",
    options: ["0 degrees", "7.5 degrees", "15 degrees", "90 degrees"]
  },
  {
    title: "The Silent Maker",
    difficulty: "hard",
    question: "The person who makes it has no need of it; the person who buys it has no use for it. The person who uses it can neither see nor feel it. What is it?",
    answer: "A coffin",
    hint: "It relates to a final resting place.",
    options: ["A coffin", "A gift", "A shield", "A shadow"]
  },
  {
    title: "Map Cities",
    difficulty: "hard",
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "A map",
    hint: "It represents parts of the earth.",
    options: ["A desert", "A dream", "A map", "A painting"]
  },
  {
    title: "Two Hourglasses",
    difficulty: "hard",
    question: "You have a 4-minute hourglass and a 7-minute hourglass. How do you measure exactly 9 minutes?",
    answer: "Start both. When 4 min hourglass ends (4 min), flip it. When 7 min hourglass ends (7 min), flip it (1 min left in 4 min). When 4 min hourglass ends (8 min), flip 7 min hourglass again to run its remaining 1 min.",
    hint: "You can track the remaining time in one hourglass when the other runs out.",
    options: [
      "Start both. When 4 ends, flip it. When 7 ends, flip it. When 4 ends again, flip 7.",
      "Run them sequentially twice",
      "It cannot be measured with these hourglasses",
      "Flip the 7-minute hourglass halfway through"
    ]
  },
  {
    title: "Alternating Truth",
    difficulty: "hard",
    question: "A traveler meets three people who always tell the truth, always lie, or alternate between truth and lies. How do you identify the alternator with one question to one person?",
    answer: "Ask 'Are you the liar?' — the truth-teller says no, liar says yes, alternator will respond based on their current state.",
    hint: "The alternator's state flips every time they speak.",
    options: ["Ask 'Are you the liar?'", "Ask 'Is 2+2=4?'", "Ask 'Does the earth go around the sun?'", "It is impossible with one question"]
  },
  {
    title: "Monty Hall Problem",
    difficulty: "hard",
    question: "You are on a game show with 3 doors. Behind one is a car, others have goats. You pick door 1. The host (who knows what's behind doors) opens door 3 to reveal a goat. He asks if you want to switch to door 2. Should you switch?",
    answer: "Yes, switching gives a 2/3 chance of winning",
    hint: "Your initial choice had a 1/3 chance of being correct.",
    options: ["Yes, switching gives a 2/3 chance of winning", "No, it makes no difference (50/50)", "No, staying with door 1 gives 2/3 chance", "It depends on the host's mood"]
  },
  {
    title: "Cheryl's Birthday",
    difficulty: "hard",
    question: "Albert and Bernard want to know Cheryl's birthday. She gives them 10 possible dates: May 15/16/19, June 17/18, July 14/16, August 14/15/17. She tells Albert the month and Bernard the day. Albert says: 'I don't know when it is, but I know Bernard doesn't know either.' Bernard says: 'At first I didn't know, but now I know.' Albert says: 'Now I know too.' When is Cheryl's birthday?",
    answer: "July 16",
    hint: "Analyze which days are unique first (19 and 18).",
    options: ["July 16", "August 17", "June 17", "May 19"]
  }
];

const JIGSAW_SAMPLES = [
  { title: "Mountain Lake", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Neon City Lights", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Autumn Forest Paths", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Alpine Lake Reflection", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Misty Green Valley", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Coral Reef Life", url: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Desert Sand Dunes", url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Lavender Fields Sunset", url: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Cherry Blossoms Spring", url: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Cosmic Northern Lights", url: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Vintage Steam Engine", url: "https://images.unsplash.com/photo-1532103054090-334e6e60ab29?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Cozy Winter Cabin", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Ocean Sunset Waves", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Ancient Medieval Castle", url: "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Hot Air Balloons Sky", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Golden Gate Bridge", url: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Majestic Waterfall", url: "https://images.unsplash.com/photo-1433832597046-4f10e10ac764?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Starry Night Sky", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Tropical Beach Island", url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Grand Canyon Desert", url: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Taj Mahal Palace", url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Eiffel Tower Paris", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Venetian Canals Gondola", url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Swiss Alps Village", url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "Great Wall of China", url: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Mount Fuji Autumn", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Santorini Cliffs Sunset", url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80", pieces: 16 },
  { title: "New York City Skyline", url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80", pieces: 24 },
  { title: "Kyoto Bamboo Groves", url: "https://images.unsplash.com/photo-1476158064186-e23111d78e30?auto=format&fit=crop&w=1200&q=80", pieces: 48 },
  { title: "Sunflower Meadow", url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80", pieces: 16 }
];

const WORD_SEARCH_THEMES = [
  // Easy
  { title: "Animal Kingdom", difficulty: "easy", words: ['CAT', 'DOG', 'BIRD', 'FISH', 'FROG', 'LION', 'TIGER', 'BEAR'] },
  { title: "Weather Wonders", difficulty: "easy", words: ['SUN', 'MOON', 'STAR', 'SKY', 'RAIN', 'SNOW', 'WIND', 'CLOUD'] },
  { title: "Colorful World", difficulty: "easy", words: ['RED', 'BLUE', 'GOLD', 'PINK', 'GREY', 'TEAL', 'ROSE', 'LIME'] },
  { title: "Sweet Fruits", difficulty: "easy", words: ['APPLE', 'BANANA', 'CHERRY', 'GRAPE', 'LEMON', 'MANGO', 'ORANGE', 'PEACH'] },
  { title: "Geometric Shapes", difficulty: "easy", words: ['CIRCLE', 'SQUARE', 'OVAL', 'CONE', 'LINE', 'STAR', 'RING', 'CUBE'] },
  { title: "School Subjects", difficulty: "easy", words: ['DESK', 'BOOK', 'PENCIL', 'RULER', 'PAPER', 'PEN', 'GLUE', 'CLASS'] },
  { title: "Ocean Life", difficulty: "easy", words: ['SHARK', 'WHALE', 'FISH', 'CRAB', 'CLAM', 'SEAL', 'JELLY', 'SQUID'] },
  { title: "Toys & Games", difficulty: "easy", words: ['DOLL', 'BALL', 'BLOCKS', 'KITE', 'TRAIN', 'PUZZLE', 'GAME', 'CAR'] },
  { title: "Kitchen Items", difficulty: "easy", words: ['CUP', 'FORK', 'SPOON', 'KNIFE', 'PLATE', 'BOWL', 'PAN', 'POT'] },
  { title: "Family Members", difficulty: "easy", words: ['MOM', 'DAD', 'SISTER', 'BROTHER', 'AUNT', 'UNCLE', 'COUSIN', 'BABY'] },
  // Medium
  { title: "Code Crafting", difficulty: "medium", words: ['PYTHON', 'JAVA', 'KOTLIN', 'SWIFT', 'RUST', 'RUBY', 'GO', 'PHP'] },
  { title: "Space Exploration", difficulty: "medium", words: ['ROCKET', 'PLANET', 'GALAXY', 'COMET', 'ORBIT', 'SOLAR', 'NASA', 'SPACE'] },
  { title: "Coffee & Drinks", difficulty: "medium", words: ['COFFEE', 'TEA', 'LATTE', 'JUICE', 'WATER', 'MILK', 'SODA', 'CHAI'] },
  { title: "Global Countries", difficulty: "medium", words: ['CANADA', 'BRAZIL', 'FRANCE', 'GERMANY', 'ITALY', 'JAPAN', 'MEXICO', 'SPAIN'] },
  { title: "Active Sports", difficulty: "medium", words: ['SOCCER', 'TENNIS', 'HOCKEY', 'RUGBY', 'GOLF', 'CHESS', 'BOXING', 'SKIING'] },
  { title: "Musical Instruments", difficulty: "medium", words: ['GUITAR', 'PIANO', 'VIOLIN', 'FLUTE', 'DRUMS', 'TRUMPET', 'CELLO', 'HARP'] },
  { title: "Dessert Treats", difficulty: "medium", words: ['CUPCAKE', 'COOKIE', 'BROWNIE', 'PUDDING', 'GELATO', 'SORBET', 'PIE', 'DONUT'] },
  { title: "Farm Animals", difficulty: "medium", words: ['HORSE', 'CHICKEN', 'ROOSTER', 'DONKEY', 'TURKEY', 'SHEEP', 'ALPACAS', 'RABBIT'] },
  { title: "Tree Varieties", difficulty: "medium", words: ['OAK', 'PINE', 'MAPLE', 'BIRCH', 'REDWOOD', 'WILLOW', 'CEDAR', 'SPRUCE'] },
  { title: "Car Components", difficulty: "medium", words: ['ENGINE', 'CLUTCH', 'BRAKE', 'WHEEL', 'TIRE', 'BUMPER', 'MIRROR', 'PISTON'] },
  // Hard
  { title: "Software Architecture", difficulty: "hard", words: ['ALGORITHM', 'DATABASE', 'FRONTEND', 'BACKEND', 'NETWORK', 'SECURITY', 'ENCRYPTION'] },
  { title: "Cosmic Mysteries", difficulty: "hard", words: ['UNIVERSE', 'ASTRONOMY', 'TELESCOPE', 'ASTEROID', 'NEBULA', 'COSMOS', 'QUASAR'] },
  { title: "Wild Landscapes", difficulty: "hard", words: ['ADVENTURE', 'MOUNTAIN', 'OCEAN', 'FOREST', 'DESERT', 'ISLAND', 'VOLCANO'] },
  { title: "Scientific Wonders", difficulty: "hard", words: ['CHEMISTRY', 'BIOLOGY', 'EVOLUTION', 'GENETICS', 'CALCULUS', 'GEOMETRY'] },
  { title: "Literary Concepts", difficulty: "hard", words: ['METAPHOR', 'NARRATOR', 'PROTAGONIST', 'ALLEGORY', 'SOLILOQUY', 'LITERATURE'] },
  { title: "Ancient Civilizations", difficulty: "hard", words: ['MESOPOTAMIA', 'EGYPTIAN', 'BABYLONIAN', 'BYZANTINE', 'PHOENICIAN', 'CARTHAGE', 'SUMERIAN'] },
  { title: "Geological Eras", difficulty: "hard", words: ['PALEOZOIC', 'MESOZOIC', 'CENOZOIC', 'JURASSIC', 'TRIASSIC', 'CRETACEOUS', 'PERMIAN'] },
  { title: "Medical Specialties", difficulty: "hard", words: ['CARDIOLOGY', 'NEUROLOGY', 'PEDIATRICS', 'ONCOLOGY', 'PSYCHIATRY', 'RADIOLOGY', 'DERMATOLOGY'] },
  { title: "Musical Genres", difficulty: "hard", words: ['CLASSICAL', 'BAROQUE', 'ORCHESTRA', 'SYMPHONY', 'CONCERTO', 'OPERATIC', 'JAZZ'] },
  { title: "Classic Literature", difficulty: "hard", words: ['ODYSSEY', 'SHAKESPEARE', 'DOMBEY', 'BEOWULF', 'GILGAMESH', 'AENEID', 'PARADISE'] }
];

const WORDLE_SAMPLES = [
  { title: "Ocean Mystery", difficulty: "easy", solution: "WATER" },
  { title: "Tech Term", difficulty: "medium", solution: "PIXEL" },
  { title: "Abstract Concept", difficulty: "hard", solution: "CHAOS" }
];

async function seed() {
  console.log('🚀 Starting puzzle seed...');
  const newPuzzles = [];

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
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

  WORD_SEARCH_THEMES.forEach((theme) => {
    const data = generateWordSearch(theme.difficulty, theme.words);
    newPuzzles.push({
      id: uuidv4(),
      title: theme.title,
      type: 'wordsearch',
      difficulty: theme.difficulty,
      puzzle_data: data,
      is_daily: false,
      play_count: 0
    });
  });

  LOGIC_PUZZLES.forEach(p => {
    const data = {
      question: p.question,
      answer: p.answer,
      hint: p.hint,
      options: p.options
    };
    newPuzzles.push({
      id: uuidv4(),
      title: p.title,
      type: 'logic',
      difficulty: p.difficulty,
      puzzle_data: data,
      is_daily: false,
      play_count: 0
    });
  });

  JIGSAW_SAMPLES.forEach((j, i) => {
    const data = {
      image_url: j.url,
      pieces: j.pieces
    };
    newPuzzles.push({
      id: uuidv4(),
      title: j.title,
      type: 'jigsaw',
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      puzzle_data: data,
      is_daily: false,
      play_count: 0
    });
  });

  WORDLE_SAMPLES.forEach(w => {
    const data = {
      solution: w.solution
    };
    newPuzzles.push({
      id: uuidv4(),
      title: w.title,
      type: 'wordle',
      difficulty: w.difficulty,
      puzzle_data: data,
      is_daily: false,
      play_count: 0
    });
  });


  console.log(`📦 Generated ${newPuzzles.length} puzzles. Refreshing Supabase table...`);

  // Clear existing puzzles to prevent duplicates
  await supabase.from('puzzles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('puzzles').insert(newPuzzles);

  if (error) {
    console.error('❌ Error seeding puzzles:', error.message);
  } else {
    console.log('✅ Successfully seeded puzzles!');
  }
}

seed();
