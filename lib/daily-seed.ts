const EASTERN_TIMEZONE = 'America/New_York'

/** Eastern date string (YYYY-MM-DD) — rotates at midnight US Eastern (EST/EDT). */
export function getTodayDateEastern(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: EASTERN_TIMEZONE })
}

export function getYesterdayDateEastern(today = getTodayDateEastern()): string {
  const [y, m, d] = today.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().split('T')[0]
}

/** @deprecated Use getTodayDateEastern() */
export const getTodayDateUTC = getTodayDateEastern

/** @deprecated Use getYesterdayDateEastern() */
export const getYesterdayDateUTC = getYesterdayDateEastern

export function dateToSeed(date: string): number {
  let hash = 0
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) || 1
}

export function createSeededRandom(seedInput: string | number): () => number {
  let state = typeof seedInput === 'string' ? dateToSeed(seedInput) : seedInput
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff
    return (state >>> 0) / 0xffffffff
  }
}

/** Pick a stable daily index; avoids repeating the same index as yesterday when possible. */
export function pickDailyIndex(poolSize: number, date: string, avoidIndex?: number): number {
  if (poolSize <= 0) return 0
  const rand = createSeededRandom(date)
  let index = Math.floor(rand() * poolSize)
  if (poolSize > 1 && avoidIndex !== undefined && avoidIndex >= 0 && index === avoidIndex) {
    index = (index + 1) % poolSize
  }
  return index
}

export function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
