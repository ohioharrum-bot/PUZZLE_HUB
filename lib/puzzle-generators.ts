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
  ],
}

export const WORD_SEARCH_THEMES_INFO = {
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

// ── Jigsaw Puzzle Generator ───────────────────────────────────
export const JIGSAW_POOL = [
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
]

export const JIGSAW_IMAGES = JIGSAW_POOL.map(j => j.url)

export function generateJigsaw(
  difficulty: 'easy' | 'medium' | 'hard',
  dateSeed?: string,
  avoidUrl?: string
) {
  const rand = dateSeed ? createSeededRandom(dateSeed) : Math.random
  const avoidIndex = avoidUrl ? JIGSAW_IMAGES.indexOf(avoidUrl) : undefined
  const index = dateSeed
    ? pickDailyIndex(JIGSAW_IMAGES.length, dateSeed, avoidIndex !== -1 && avoidIndex !== undefined ? avoidIndex : undefined)
    : Math.floor(rand() * JIGSAW_IMAGES.length)

  const pieces = difficulty === 'easy' ? 16 : difficulty === 'medium' ? 24 : 48
  return {
    title: JIGSAW_POOL[index].title,
    image_url: JIGSAW_IMAGES[index],
    pieces
  }
}