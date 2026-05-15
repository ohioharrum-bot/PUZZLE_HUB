export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('puzzle_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('puzzle_session', id)
  }
  return id
}