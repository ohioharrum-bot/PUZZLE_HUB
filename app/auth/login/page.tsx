'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[28px] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <Brain className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-xs text-black/45">
            {isSignUp ? 'Track your puzzles and climb the leaderboard' : 'Sign in to your PuzzleHub account'}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-black/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-black/30"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}
          {message && <p className="text-xs text-green-600">{message}</p>}

          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-black/45">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            className="font-medium text-black underline-offset-2 hover:underline">
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
