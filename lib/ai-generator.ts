import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateAILogicPuzzle(difficulty: string) {
  const prompt = `Generate a creative logic puzzle or lateral thinking riddle for a puzzle game.
  Difficulty: ${difficulty}
  Format: JSON with the following structure:
  {
    "question": "the riddle text",
    "answer": "the correct answer",
    "hint": "a helpful hint",
    "options": ["option A", "option B", "option C", "option D"]
  }
  Ensure one of the options is exactly the correct answer. Make it unique and engaging.`

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
  })

  return JSON.parse(chatCompletion.choices[0].message.content || '{}')
}

export async function generateAIWordSearchTheme(difficulty: string) {
  const wordCount = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10
  const prompt = `Pick a fun, specific theme (e.g., "Deep Sea", "Cyberpunk", "Italian Cuisine") and provide ${wordCount} words related to it for a word search puzzle.
  Difficulty: ${difficulty}
  Format: JSON with the following structure:
  {
    "theme": "Theme Name",
    "words": ["WORD1", "WORD2", ...]
  }
  Ensure words are uppercase and between 3-10 letters long.`

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
  })

  return JSON.parse(chatCompletion.choices[0].message.content || '{}')
}
