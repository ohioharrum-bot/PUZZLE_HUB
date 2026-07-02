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

const JIGSAW_POOL = [
  { title: "Mountain Lake", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" },
  { title: "Neon City Lights", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80" },
  { title: "Autumn Forest Paths", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80" },
  { title: "Alpine Lake Reflection", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80" },
  { title: "Misty Green Valley", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80" },
  { title: "Coral Reef Life", url: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80" },
  { title: "Desert Sand Dunes", url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80" },
  { title: "Lavender Fields Sunset", url: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80" },
  { title: "Cherry Blossoms Spring", url: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=1200&q=80" },
  { title: "Cosmic Northern Lights", url: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=1200&q=80" },
  { title: "Vintage Steam Engine", url: "https://images.unsplash.com/photo-1532103054090-334e6e60ab29?auto=format&fit=crop&w=1200&q=80" },
  { title: "Cozy Winter Cabin", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80" },
  { title: "Ocean Sunset Waves", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80" },
  { title: "Ancient Medieval Castle", url: "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80" },
  { title: "Hot Air Balloons Sky", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
  { title: "Golden Gate Bridge", url: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1200&q=80" },
  { title: "Majestic Waterfall", url: "https://images.unsplash.com/photo-1433832597046-4f10e10ac764?auto=format&fit=crop&w=1200&q=80" },
  { title: "Starry Night Sky", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80" },
  { title: "Tropical Beach Island", url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80" },
  { title: "Grand Canyon Desert", url: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=1200&q=80" },
  { title: "Taj Mahal Palace", url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80" },
  { title: "Eiffel Tower Paris", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" },
  { title: "Venetian Canals Gondola", url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80" },
  { title: "Swiss Alps Village", url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80" },
  { title: "Great Wall of China", url: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=1200&q=80" },
  { title: "Mount Fuji Autumn", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" },
  { title: "Santorini Cliffs Sunset", url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80" },
  { title: "New York City Skyline", url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80" },
  { title: "Kyoto Bamboo Groves", url: "https://images.unsplash.com/photo-1476158064186-e23111d78e30?auto=format&fit=crop&w=1200&q=80" },
  { title: "Sunflower Meadow", url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80" }
];

const JIGSAW_IMAGES = JIGSAW_POOL.map(j => j.url);

const WORDLE_FALLBACK_WORDS = [
  "CLOCK", "PLANT", "LIGHT", "WATER", "HOUSE", "PLANE", "SHARK", "TRAIN", "SMILE", "STONE",
  "FLAME", "SWEET", "DREAM", "HEART", "CLOUD", "BREAD", "NIGHT", "GREEN", "PAPER", "SOUND",
  "WORLD", "MUSIC", "FRUIT", "WHITE", "BLACK", "GLASS", "BOARD", "CHAIR", "STORM", "MIGHT",
  "FLOOR", "PHONE", "SHINE", "SHIRT", "TABLE", "MOUTH", "EARTH", "LUNCH", "CHIPS", "BEACH",
  "WHEAT", "GRAPE", "CHAMP", "SMART", "BRAVE", "PIXEL", "SPACE", "BRUSH", "FLUTE", "BRICK"
];

const WORD_BANKS = {
  easy: [
    ['CAT', 'DOG', 'BIRD', 'FISH', 'FROG', 'LION', 'TIGER', 'BEAR', 'WOLF', 'DUCK', 'DEER', 'GOAT', 'LAMB', 'PIG'],
    ['SUN', 'MOON', 'STAR', 'SKY', 'RAIN', 'SNOW', 'WIND', 'CLOUD', 'HEAT', 'COLD', 'MIST', 'FOG', 'STORM'],
    ['RED', 'BLUE', 'GOLD', 'PINK', 'GREY', 'TEAL', 'ROSE', 'LIME', 'NAVY', 'AQUA', 'JADE', 'PLUM', 'RUBY'],
    ['APPLE', 'BANANA', 'CHERRY', 'GRAPE', 'LEMON', 'MANGO', 'ORANGE', 'PEACH', 'PEAR', 'PLUM', 'MELON', 'BERRY'],
    ['CIRCLE', 'SQUARE', 'OVAL', 'CONE', 'LINE', 'STAR', 'RING', 'CUBE', 'ARC', 'BOX'],
    ['DESK', 'BOOK', 'PENCIL', 'RULER', 'PAPER', 'PEN', 'GLUE', 'CLASS', 'STUDY', 'TEACH', 'LEARN'],
    ['SHARK', 'WHALE', 'FISH', 'CRAB', 'CLAM', 'SEAL', 'JELLY', 'SQUID', 'STAR', 'REEF', 'WAVE', 'TIDE'],
    ['DOLL', 'BALL', 'BLOCKS', 'KITE', 'TRAIN', 'PUZZLE', 'GAME', 'CAR', 'TRUCK', 'BOAT', 'BEAR', 'YO-YO'],
    ['CUP', 'FORK', 'SPOON', 'KNIFE', 'PLATE', 'BOWL', 'PAN', 'POT', 'OVEN', 'STOVE', 'SINK', 'MUG', 'DISH'],
    ['MOM', 'DAD', 'SISTER', 'BROTHER', 'AUNT', 'UNCLE', 'COUSIN', 'BABY', 'SON', 'DAUGHTER', 'GRANDMA', 'GRANDPA'],
    ['HAND', 'FOOT', 'HEAD', 'FACE', 'EYE', 'EAR', 'NOSE', 'MOUTH', 'ARM', 'LEG', 'HAIR', 'KNEE', 'ELBOW'],
    ['ROSE', 'TULIP', 'DAISY', 'LILY', 'ORCHID', 'POPPY', 'LOTUS', 'VIOLET', 'IRIS', 'SUNFLOWER', 'PETAL'],
    ['SHIRT', 'PANTS', 'SOCKS', 'SHOES', 'HAT', 'COAT', 'DRESS', 'SKIRT', 'GLOVE', 'SCARF', 'BOOTS', 'JACKET'],
    ['BED', 'SOFA', 'CHAIR', 'TABLE', 'DESK', 'LAMP', 'SHELF', 'RUG', 'CLOSET', 'CABINET', 'CLOCK', 'DOOR'],
    ['ROBIN', 'CROW', 'JAY', 'FINCH', 'DOVE', 'HAWK', 'OWL', 'EAGLE', 'SPARROW', 'GULL', 'SWAN', 'HERON', 'DUCK'],
    ['SUN', 'CLOUD', 'RAINBOW', 'BIRD', 'PLANE', 'KITE', 'BALLOON', 'STAR', 'MOON', 'ROCKET', 'HELI', 'UFO']
  ],
  medium: [
    ['PYTHON', 'JAVA', 'KOTLIN', 'SWIFT', 'RUST', 'RUBY', 'GO', 'PHP', 'HTML', 'CSS', 'REACT', 'NODE', 'SQL', 'DOCKER', 'LINUX'],
    ['ROCKET', 'PLANET', 'GALAXY', 'COMET', 'ORBIT', 'SOLAR', 'NASA', 'SPACE', 'METEOR', 'ASTRO', 'COSMOS', 'HUBBLE', 'LUNAR', 'VENUS', 'MARS'],
    ['COFFEE', 'TEA', 'LATTE', 'JUICE', 'WATER', 'MILK', 'SODA', 'CHAI', 'MOCHA', 'BREW', 'MATCHA', 'SHAKE', 'SMOOTHIE', 'COCOA'],
    ['CANADA', 'BRAZIL', 'FRANCE', 'GERMANY', 'ITALY', 'JAPAN', 'MEXICO', 'SPAIN', 'INDIA', 'CHINA', 'EGYPT', 'SWEDEN', 'NORWAY'],
    ['SOCCER', 'TENNIS', 'HOCKEY', 'RUGBY', 'GOLF', 'CHESS', 'BOXING', 'SKIING', 'ROWING', 'SAILING', 'CRICKET', 'SQUASH'],
    ['GUITAR', 'PIANO', 'VIOLIN', 'FLUTE', 'DRUMS', 'TRUMPET', 'CELLO', 'HARP', 'BANJO', 'SAXOPHONE', 'ACCORDION'],
    ['CUPCAKE', 'COOKIE', 'BROWNIE', 'PUDDING', 'GELATO', 'SORBET', 'PIE', 'DONUT', 'PASTRY', 'MUFFIN', 'SUNDAE', 'FUDGE', 'TART'],
    ['HORSE', 'CHICKEN', 'ROOSTER', 'DONKEY', 'TURKEY', 'SHEEP', 'ALPACAS', 'RABBIT', 'LLAMA', 'CATTLE', 'PIGEON', 'STALLION'],
    ['OAK', 'PINE', 'MAPLE', 'BIRCH', 'REDWOOD', 'WILLOW', 'CEDAR', 'SPRUCE', 'CHERRY', 'PALM', 'ELM', 'ASH', 'WALNUT', 'CYPRESS'],
    ['ENGINE', 'CLUTCH', 'BRAKE', 'WHEEL', 'TIRE', 'BUMPER', 'MIRROR', 'PISTON', 'SPARK', 'BATTERY', 'WIPER', 'FILTER', 'RADAR'],
    ['TENT', 'PACK', 'SLEEP', 'STOVE', 'MATCH', 'LAMP', 'ROPE', 'MAP', 'COMPASS', 'KNIFE', 'COOLER', 'HEATER', 'FLASHLIGHT'],
    ['TORNADO', 'BLIZZARD', 'TYPHOON', 'DRIZZLE', 'BREEZE', 'CLIMATE', 'HUMID', 'THUNDER', 'LIGHTNING', 'MONSOON', 'FREEZE'],
    ['STAPLER', 'FOLDER', 'BINDER', 'MARKER', 'ERASER', 'SCISSORS', 'CALCULATOR', 'PLANNER', 'CALENDAR', 'JOURNAL'],
    ['HAPPY', 'ANGRY', 'SAD', 'SCARED', 'BORED', 'EXCITED', 'PROUD', 'CALM', 'GUILTY', 'JEALOUS', 'SHY', 'SILLY', 'TIRED'],
    ['LONDON', 'PARIS', 'BERLIN', 'ROME', 'MADRID', 'VIENNA', 'PRAGUE', 'DUBLIN', 'BRUSSELS', 'ATHENS', 'LISBON', 'WARSAW'],
    ['BAKE', 'BROIL', 'ROAST', 'GRILL', 'STEAM', 'BOIL', 'FRY', 'SAUTE', 'SIMMER', 'POACH', 'TOAST', 'SEAR', 'BLANCH']
  ],
  hard: [
    ['ALGORITHM', 'DATABASE', 'FRONTEND', 'BACKEND', 'NETWORK', 'SECURITY', 'ENCRYPTION', 'FRAMEWORK', 'INTERFACE', 'PROTOCOL', 'COMPILER'],
    ['UNIVERSE', 'ASTRONOMY', 'TELESCOPE', 'ASTEROID', 'NEBULA', 'COSMOS', 'QUASAR', 'GRAVITY', 'ECLIPSE', 'STARLIGHT', 'INFINITY'],
    ['ADVENTURE', 'MOUNTAIN', 'OCEAN', 'FOREST', 'DESERT', 'ISLAND', 'VOLCANO', 'CANYON', 'GLACIER', 'SAVANNA', 'PLATEAU', 'VALLEY'],
    ['CHEMISTRY', 'BIOLOGY', 'EVOLUTION', 'GENETICS', 'CALCULUS', 'GEOMETRY', 'EQUATION', 'SPECTRUM', 'QUANTUM', 'MOLECULE'],
    ['METAPHOR', 'NARRATOR', 'PROTAGONIST', 'ALLEGORY', 'SOLILOQUY', 'LITERATURE', 'BIOGRAPHY', 'ANTHOLOGY', 'PARADOX'],
    ['SKYSCRAPER', 'CATHEDRAL', 'MONUMENT', 'BLUEPRINT', 'FOUNDATION', 'SCAFFOLDING', 'REINFORCE', 'STRUCTURE'],
    ['MESOPOTAMIA', 'EGYPTIAN', 'BABYLONIAN', 'BYZANTINE', 'PHOENICIAN', 'CARTHAGE', 'OLMEC', 'ZAPOTEC', 'SUMERIAN'],
    ['PALEOZOIC', 'MESOZOIC', 'CENOZOIC', 'JURASSIC', 'TRIASSIC', 'CRETACEOUS', 'PERMIAN', 'DEVONIAN', 'SILURIAN'],
    ['CARDIOLOGY', 'NEUROLOGY', 'PEDIATRICS', 'ONCOLOGY', 'PSYCHIATRY', 'RADIOLOGY', 'DERMATOLOGY', 'PATHOLOGY'],
    ['CLASSICAL', 'BAROQUE', 'ORCHESTRA', 'SYMPHONY', 'CONCERTO', 'OPERATIC', 'JAZZ', 'BLUEGRASS', 'ELECTRONICA'],
    ['EXISTENTIAL', 'NIHILISM', 'PRAGMATISM', 'STOICISM', 'RATIONALISM', 'EMPIRICISM', 'IDEALISM', 'DUALISM'],
    ['BIODIVERSITY', 'ECOSYSTEM', 'BIOSPHERE', 'HABITAT', 'CONSERVATION', 'POLLUTION', 'RECYCLING', 'SUSTAIN'],
    ['APOLLO', 'VOYAGER', 'PIONEER', 'CASSINI', 'GALILEO', 'SPUTNIK', 'PATHFINDER', 'MARINER', 'ROVER', 'SHUTTLE'],
    ['TRIGONOMETRY', 'STATISTICAL', 'PROBABILITY', 'ALGEBRAIC', 'TOPOLOGY', 'VECTOR', 'MATRIX', 'INTEGRAL'],
    ['ODYSSEY', 'SHAKESPEARE', 'DOMBEY', 'BEOWULF', 'GILGAMESH', 'AENEID', 'PARADISE', 'INFERNO', 'FAUST', 'DRACULA'],
    ['BATHYPELAGIC', 'ABYSSAL', 'BENTHIC', 'PHYTOPLANKTON', 'ZOOPLANKTON', 'TRENCH', 'SEAMOUNT', 'ESTUARY']
  ]
};

const WORD_SEARCH_THEMES_INFO = {
  easy: [
    "Animal Kingdom", "Weather Wonders", "Colorful World", "Sweet Fruits", "Geometric Shapes", "School Subjects",
    "Ocean Life", "Toys & Games", "Kitchen Items", "Family Members", "Body Parts", "Garden Flowers",
    "Clothing Items", "Home Furniture", "Backyard Birds", "In The Sky"
  ],
  medium: [
    "Code Crafting", "Space Exploration", "Coffee & Drinks", "Global Countries", "Active Sports", "Musical Instruments",
    "Dessert Treats", "Farm Animals", "Tree Varieties", "Car Components", "Camping Gear", "Weather Terms",
    "Office Supplies", "Human Emotions", "European Cities", "Cooking Methods"
  ],
  hard: [
    "Software Architecture", "Cosmic Mysteries", "Wild Landscapes", "Scientific Wonders", "Literary Concepts", "Architecture & Structures",
    "Ancient Civilizations", "Geological Eras", "Medical Specialties", "Musical Genres", "Philosophical Concepts", "Ecological Systems",
    "Spacecraft & Missions", "Advanced Mathematics", "Classic Literature", "Marine Oceanography"
  ]
};

const LOGIC_PUZZLE_POOLS = {
  easy: [
    {
      title: "Apples & Oranges",
      question: "There are 3 boxes. One has apples, one has oranges, one has both. All labels are wrong. You can pick one fruit from one box. Which box do you pick from to figure out all labels?",
      answer: "The box labeled 'Both'",
      hint: "Since all labels are wrong, the 'Both' box must contain only one fruit.",
      options: ["Box labeled 'Apples'", "Box labeled 'Oranges'", "Box labeled 'Both'", "Any box works"]
    },
    {
      title: "Rooster Egg",
      question: "A rooster lays an egg on top of a barn roof. Which way does it roll?",
      answer: "Roosters don't lay eggs",
      hint: "Think about what a rooster actually is.",
      options: ["Left", "Right", "Doesn't roll – it slides", "Roosters don't lay eggs"]
    },
    {
      title: "The Wet Towel",
      question: "What gets wetter the more it dries?",
      answer: "A towel",
      hint: "You use it after a shower.",
      options: ["A sponge", "A towel", "The sun", "Sand"]
    },
    {
      title: "Silent Whisper",
      question: "I speak without a mouth and hear without ears. What am I?",
      answer: "An echo",
      hint: "You hear it in mountains and empty halls.",
      options: ["A ghost", "An echo", "The wind", "A shadow"]
    },
    {
      title: "The Board Game",
      question: "A man pushes his car to a hotel and realizes he's bankrupt. What game is he playing?",
      answer: "Monopoly",
      hint: "It's a board game with properties and hotels.",
      options: ["Chess", "Monopoly", "Clue", "Risk"]
    },
    {
      title: "Hands of Time",
      question: "What has hands but cannot clap?",
      answer: "A clock",
      hint: "It is used to tell time.",
      options: ["A clock", "A glove", "A tree", "A crab"]
    },
    {
      title: "The More You Take",
      question: "The more of them you take, the more you leave behind. What are they?",
      answer: "Footsteps",
      hint: "Think about walking.",
      options: ["Footsteps", "Seconds", "Memories", "Breaths"]
    },
    {
      title: "What Has One Eye",
      question: "What has one eye but cannot see?",
      answer: "A needle",
      hint: "It is used in sewing.",
      options: ["A needle", "A storm", "A potato", "A lock"]
    },
    {
      title: "What Has a Head and Tail",
      question: "What has a head and a tail but no body?",
      answer: "A coin",
      hint: "You toss it to make a decision.",
      options: ["A coin", "A snake", "A kite", "A shadow"]
    },
    {
      title: "Headless Neck",
      question: "What has a neck but no head?",
      answer: "A bottle",
      hint: "It holds liquids.",
      options: ["A bottle", "A shirt", "A guitar", "A violin"]
    },
    {
      title: "Up and Never Down",
      question: "What goes up but never comes down?",
      answer: "Your age",
      hint: "It increases every year.",
      options: ["Your age", "A balloon", "The temperature", "Smoke"]
    },
    {
      title: "Keys but No Locks",
      question: "What has keys but no locks, space but no room, and you can enter but can't go outside?",
      answer: "A keyboard",
      hint: "You are using it right now.",
      options: ["A keyboard", "A piano", "A map", "A prison"]
    },
    {
      title: "Belongs To You",
      question: "What belongs to you, but other people use it more than you do?",
      answer: "Your name",
      hint: "It is how people call you.",
      options: ["Your name", "Your phone", "Your money", "Your car"]
    },
    {
      title: "Catch but Not Throw",
      question: "What can you catch but not throw?",
      answer: "A cold",
      hint: "It makes you sneeze.",
      options: ["A cold", "A ball", "A shadow", "A secret"]
    },
    {
      title: "Friday Before Thursday",
      question: "Where does Friday come before Thursday?",
      answer: "In the dictionary",
      hint: "Alphabetical order matters here.",
      options: ["In the dictionary", "In a leap year", "In outer space", "On a calendar"]
    }
  ],
  medium: [
    {
      title: "Burning Ropes",
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
      question: "A farmer has 17 sheep. All but 9 die. How many are left?",
      answer: "9",
      hint: "Read 'all but 9' carefully.",
      options: ["8", "9", "17", "0"]
    },
    {
      title: "Corner Traveler",
      question: "What can travel around the world while staying in a corner?",
      answer: "A stamp",
      hint: "You find it on letters and postcards.",
      options: ["A coin", "A stamp", "A map", "A passport"]
    },
    {
      title: "Fragile Whisper",
      question: "What is so fragile that saying its name breaks it?",
      answer: "Silence",
      hint: "Think about quietness.",
      options: ["Glass", "A secret", "Silence", "An egg"]
    },
    {
      title: "Mary's Father",
      question: "Mary's father has five daughters: Nana, Nene, Nini, Nono, and who?",
      answer: "Mary",
      hint: "Re-read the first word of the riddle.",
      options: ["Nunu", "Mary", "Nana", "None of the above"]
    },
    {
      title: "The River Crossing",
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
      question: "The red house is made of red bricks, the blue house is made of blue bricks. What is the greenhouse made of?",
      answer: "Glass",
      hint: "Think about where plants grow.",
      options: ["Green bricks", "Glass", "Wood", "Leaves"]
    },
    {
      title: "Three Light Switches",
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
      question: "A boy has as many sisters as brothers, but each sister has only half as many sisters as brothers. How many brothers and sisters are in the family?",
      answer: "4 brothers and 3 sisters",
      hint: "Think about the total number of siblings.",
      options: ["3 brothers and 2 sisters", "4 brothers and 3 sisters", "2 brothers and 1 sister", "5 brothers and 4 sisters"]
    },
    {
      title: "The Barber of Seville",
      question: "In Seville, there is a barber who shaves all men, and only those men, who do not shave themselves. Does the barber shave himself?",
      answer: "It is a logical paradox",
      hint: "If he shaves himself, he shouldn't. If he doesn't, he must.",
      options: ["Yes, he shaves himself", "No, he does not shave himself", "It is a logical paradox", "Only on weekends"]
    }
  ],
  hard: [
    {
      title: "100 Prisoners",
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
      question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
      answer: "7.5 degrees",
      hint: "The hour hand moves between numbers, not just at 3.",
      options: ["0 degrees", "7.5 degrees", "15 degrees", "90 degrees"]
    },
    {
      title: "The Silent Maker",
      question: "The person who makes it has no need of it; the person who buys it has no use for it. The person who uses it can neither see nor feel it. What is it?",
      answer: "A coffin",
      hint: "It relates to a final resting place.",
      options: ["A coffin", "A gift", "A shield", "A shadow"]
    },
    {
      title: "Map Cities",
      question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
      answer: "A map",
      hint: "It represents parts of the earth.",
      options: ["A desert", "A dream", "A map", "A painting"]
    },
    {
      title: "Two Hourglasses",
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
      question: "A traveler meets three people who always tell the truth, always lie, or alternate between truth and lies. How do you identify the alternator with one question to one person?",
      answer: "Ask 'Are you the liar?' — the truth-teller says no, liar says yes, alternator will respond based on their current state.",
      hint: "The alternator's state flips every time they speak.",
      options: ["Ask 'Are you the liar?'", "Ask 'Is 2+2=4?'", "Ask 'Does the earth go around the sun?'", "It is impossible with one question"]
    },
    {
      title: "Monty Hall Problem",
      question: "You are on a game show with 3 doors. Behind one is a car, others have goats. You pick door 1. The host (who knows what's behind doors) opens door 3 to reveal a goat. He asks if you want to switch to door 2. Should you switch?",
      answer: "Yes, switching gives a 2/3 chance of winning",
      hint: "Your initial choice had a 1/3 chance of being correct.",
      options: ["Yes, switching gives a 2/3 chance of winning", "No, it makes no difference (50/50)", "No, staying with door 1 gives 2/3 chance", "It depends on the host's mood"]
    },
    {
      title: "Cheryl's Birthday",
      question: "Albert and Bernard want to know Cheryl's birthday. She gives them 10 possible dates: May 15/16/19, June 17/18, July 14/16, August 14/15/17. She tells Albert the month and Bernard the day. Albert says: 'I don't know when it is, but I know Bernard doesn't know either.' Bernard says: 'At first I didn't know, but now I know.' Albert says: 'Now I know too.' When is Cheryl's birthday?",
      answer: "July 16",
      hint: "Analyze which days are unique first (19 and 18).",
      options: ["July 16", "August 17", "June 17", "May 19"]
    }
  ]
};

// Seeded random utilities for deterministic date rotation
function dateToSeed(date) {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function createSeededRandom(seedInput) {
  let state = typeof seedInput === 'string' ? dateToSeed(seedInput) : seedInput;
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
}

function pickDailyIndex(poolSize, date, avoidIndex) {
  if (poolSize <= 0) return 0;
  const rand = createSeededRandom(date);
  let index = Math.floor(rand() * poolSize);
  if (poolSize > 1 && avoidIndex !== undefined && avoidIndex >= 0 && index === avoidIndex) {
    index = (index + 1) % poolSize;
  }
  return index;
}

function getYesterdayDate(todayStr) {
  const [y, m, d] = todayStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
}

function getYesterdayWordSearchAvoidBank(yesterdayData, difficulty) {
  if (!yesterdayData || !yesterdayData.words || !yesterdayData.words.length) return undefined;
  const bankList = WORD_BANKS[difficulty];
  const idx = bankList.findIndex(bank => yesterdayData.words.some(w => bank.includes(w)));
  return idx >= 0 ? idx : undefined;
}

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
  const yesterday = getYesterdayDate(today);
  console.log(`🚀 Generating daily puzzles for ${today} (${dateFriendly})...`);

  console.log(`🔍 Fetching recent daily puzzles to avoid repeats...`);
  const { data: recentPuzzles } = await supabase
    .from('puzzles')
    .select('type, puzzle_data')
    .eq('is_daily', true)
    .lt('daily_date', today)
    .order('daily_date', { ascending: false })
    .limit(50); // Fetch up to 10 days of the 5 puzzle types

  const recentPuzzlesMap = {
    sudoku: [],
    wordsearch: [],
    logic: [],
    wordle: [],
    jigsaw: []
  };
  if (recentPuzzles) {
    recentPuzzles.forEach(p => {
      if (recentPuzzlesMap[p.type]) {
        recentPuzzlesMap[p.type].push(p.puzzle_data);
      }
    });
  }

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
    content: sudokuData,
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 2. Word Search (theme lists rotation or AI)
  const theme = await generateAITheme();
  let wsData;
  let wsTitle;
  if (theme) {
    wsData = generateWordSearch(theme.words);
    wsTitle = `Daily Word Search: ${theme.theme} - ${dateFriendly}`;
  } else {
    const recentWSData = recentPuzzlesMap['wordsearch'];
    const recentWordsList = recentWSData.map(d => d.words ?? []);
    const banks = WORD_BANKS['medium'];
    
    // Find a bank that doesn't share words with recently used word searches
    let chosenBankIndex = -1;
    for (let i = 0; i < banks.length; i++) {
      const bank = banks[i];
      const overlaps = recentWordsList.some(words => words.some(w => bank.includes(w)));
      if (!overlaps) {
        chosenBankIndex = i;
        break;
      }
    }
    if (chosenBankIndex === -1) {
      chosenBankIndex = Math.floor(Math.random() * banks.length);
    }
    
    const selectedBank = banks[chosenBankIndex];
    // Shuffle and pick 7 words deterministically
    const rand = createSeededRandom(today);
    const shuffledBank = [...selectedBank];
    for (let i = shuffledBank.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffledBank[i], shuffledBank[j]] = [shuffledBank[j], shuffledBank[i]];
    }
    const words = shuffledBank.slice(0, 7);
    wsData = generateWordSearch(words);
    wsTitle = `Daily Word Search: ${WORD_SEARCH_THEMES_INFO['medium'][chosenBankIndex] || 'Classic Theme'} - ${dateFriendly}`;
  }
  puzzles.push({
    id: uuidv4(),
    title: wsTitle,
    type: 'wordsearch',
    difficulty: 'medium',
    puzzle_data: wsData,
    content: wsData,
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 3. Logic (pool rotation or AI)
  const riddle = await generateAIRiddle();
  let logicData;
  if (riddle) {
    logicData = riddle;
  } else {
    const recentLogicData = recentPuzzlesMap['logic'];
    const recentQuestions = recentLogicData.map(d => d.question);
    const pool = LOGIC_PUZZLE_POOLS['medium'];
    
    // Find a question not recently used
    const available = pool.filter(p => !recentQuestions.includes(p.question));
    logicData = available.length > 0 
      ? available[Math.floor(Math.random() * available.length)] 
      : pool[Math.floor(Math.random() * pool.length)];
  }
  puzzles.push({
    id: uuidv4(),
    title: `Daily Riddle - ${dateFriendly}`,
    type: 'logic',
    difficulty: 'medium',
    puzzle_data: logicData,
    content: logicData,
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 4. Word Guesser (pool rotation or AI)
  const aiWord = await generateAIWord();
  let wordSolution;
  let wordTitle;
  if (aiWord) {
    wordSolution = aiWord.word.toUpperCase();
    wordTitle = `Daily Word Guesser: ${aiWord.hint || '5-Letter Word'} - ${dateFriendly}`;
  } else {
    const yesterdayWordle = recentPuzzlesMap['wordle']?.[0];
    const avoidWord = yesterdayWordle?.solution;
    const avoidIndex = avoidWord ? WORDLE_FALLBACK_WORDS.indexOf(avoidWord) : undefined;
    const wordIndex = pickDailyIndex(WORDLE_FALLBACK_WORDS.length, today, avoidIndex !== -1 && avoidIndex !== undefined ? avoidIndex : undefined);
    wordSolution = WORDLE_FALLBACK_WORDS[wordIndex];
    wordTitle = `Daily Word Guesser - ${dateFriendly}`;
  }
  puzzles.push({
    id: uuidv4(),
    title: wordTitle,
    type: 'wordle',
    difficulty: 'medium',
    puzzle_data: { solution: wordSolution },
    content: { solution: wordSolution },
    is_daily: true,
    daily_date: today,
    play_count: 0
  });

  // 5. Jigsaw (pool rotation)
  const recentJigsawData = recentPuzzlesMap['jigsaw'];
  const recentUrls = recentJigsawData.map(d => d.image_url);
  const available = JIGSAW_IMAGES.filter(url => !recentUrls.includes(url));
  const chosenUrl = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : JIGSAW_IMAGES[Math.floor(Math.random() * JIGSAW_IMAGES.length)];
  
  const imageIndex = JIGSAW_IMAGES.indexOf(chosenUrl);
  const pieces = [16, 24, 48][imageIndex % 3];
  puzzles.push({
    id: uuidv4(),
    title: `Daily Jigsaw - ${dateFriendly}`,
    type: 'jigsaw',
    difficulty: 'medium',
    puzzle_data: { image_url: chosenUrl, pieces },
    content: { image_url: chosenUrl, pieces },
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
