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
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: 'https://gizmopuzzles.com/auth/callback',
        }
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  const handleSocialAuth = async (provider: 'google') => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'https://gizmopuzzles.com/auth/callback',
      },
    })
    if (error) setError(error.message)
  }

  const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Abstract background blobs for theme visibility */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-indigo-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-orange-100 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm rounded-[32px] border border-black/10 bg-white/90 p-8 shadow-xl shadow-black/5 backdrop-blur-md relative z-10">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <Brain className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-xs text-black/45">
            {isSignUp ? 'Track your puzzles and climb the leaderboard' : 'Sign in to your Gizmopuzzle account'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSocialAuth('google')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-black/5 active:scale-[0.98]"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">or email</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full rounded-xl border-2 border-black/10 bg-white px-4 py-2.5 text-sm text-black outline-none placeholder:text-black/30 focus:border-black/40 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full rounded-xl border-2 border-black/10 bg-white px-4 py-2.5 text-sm text-black outline-none placeholder:text-black/30 focus:border-black/40 transition-colors"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
          {message && <p className="text-xs font-medium text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">{message}</p>}

          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-black/90 disabled:opacity-30 active:scale-[0.98]"
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
