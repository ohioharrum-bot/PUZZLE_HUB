'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

type Tab = 'login' | 'signup'

function getPasswordStrength(val: string) {
  let score = 0
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#dc2626', '#ca8a04', '#ca8a04', '#16a34a']
  return {
    score,
    label: labels[score - 1] || 'Weak',
    color: colors[score - 1] || '#dc2626',
  }
}

function LoginContent() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const gatedMessage = searchParams.get('message')
  const strength = getPasswordStrength(password)

  const switchTab = (next: Tab) => {
    setTab(next)
    setError('')
    setMessage('')
  }

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (tab === 'signup' && !termsAccepted) {
      setError('Please accept the terms to continue.')
      setLoading(false)
      return
    }

    if (tab === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { first_name: firstName, last_name: lastName },
        },
      })
      if (signUpError) setError(signUpError.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError(signInError.message)
      else router.push('/')
    }
    setLoading(false)
  }

  const handleSocialAuth = async () => {
    setError('')
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) setError(oauthError.message)
  }

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )

  return (
    <div className="auth-layout">
      <div className="left-panel">
        <Link href="/" className="left-logo">
          <div className="logo-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
              <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <span className="logo-text">Gizmopuzzle</span>
        </Link>

        <div className="left-center">
          <h1 className="left-tagline">
            Sharpen your mind.<br />
            <span>One puzzle</span> at a time.
          </h1>
          <p className="left-sub">
            Free daily puzzles across Sudoku, Word Search, Logic, and Jigsaw. Create an account to track progress and unlock more.
          </p>
          <div className="preview-cards">
            <div className="preview-card">
              <div className="preview-icon" style={{ background: '#dbeafe' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <div className="preview-text">
                <span className="preview-title">Daily Sudoku</span>
                <span className="preview-meta">Easy · Free</span>
              </div>
              <span className="preview-pill pill-free">Free</span>
            </div>
            <div className="preview-card">
              <div className="preview-icon" style={{ background: '#ede9fe' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth="1.8">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="preview-text">
                <span className="preview-title">Logic Riddles</span>
                <span className="preview-meta">Logic · Medium</span>
              </div>
              <span className="preview-pill pill-locked">Sign up</span>
            </div>
          </div>
        </div>

        <div className="left-footer">© {new Date().getFullYear()} Gizmopuzzle. All rights reserved.</div>
      </div>

      <div className="right-panel">
        <div className="auth-box">
          <div className="auth-tabs">
            <button type="button" className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Log in</button>
            <button type="button" className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Sign up</button>
          </div>

          {tab === 'login' ? (
            <div className="login-form">
              <div className="auth-header">
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">Log in to continue your puzzle streak.</p>
              </div>

              <div className="social-btns">
                <button type="button" className="social-btn" onClick={handleSocialAuth}>
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              <div className="auth-form">
                <div className="form-field">
                  <label className="form-label" htmlFor="login-email">Email address</label>
                  <input id="login-email" className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <div className="password-wrap">
                    <input id="login-password" className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {gatedMessage && !error && !message && <p className="form-error">{gatedMessage}</p>}
                {error && <p className="form-error">{error}</p>}
                {message && <p className="form-error" style={{ color: 'var(--success)' }}>{message}</p>}
                <button type="button" className="btn-submit" onClick={handleAuth} disabled={loading || !email || !password}>
                  {loading ? 'Please wait…' : 'Log in'}
                </button>
              </div>

              <p className="switch-text">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => switchTab('signup')}>Sign up free</button>
              </p>
            </div>
          ) : (
            <div className="signup-form visible">
              <div className="auth-header">
                <h2 className="auth-title">Create account</h2>
                <p className="auth-subtitle">Free forever. Unlock Medium puzzles instantly.</p>
              </div>

              <div className="social-btns">
                <button type="button" className="social-btn" onClick={handleSocialAuth}>
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              <div className="auth-form">
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="first-name">First name</label>
                    <input id="first-name" className="form-input" type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="last-name">Last name</label>
                    <input id="last-name" className="form-input" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="signup-email">Email address</label>
                  <input id="signup-email" className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="signup-password">Password</label>
                  <div className="password-wrap">
                    <input id="signup-password" className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="password-strength">
                      <div className="strength-bars">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className="strength-bar" style={i < strength.score ? { background: strength.color } : undefined} />
                        ))}
                      </div>
                      <span className="strength-text" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <div className="terms-row">
                  <button type="button" className="terms-checkbox" onClick={() => setTermsAccepted(v => !v)} aria-pressed={termsAccepted}>
                    {termsAccepted && (
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <p className="terms-text">
                    I agree to the <Link href="/privacy">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
                  </p>
                </div>
                {error && <p className="form-error">{error}</p>}
                {message && <p className="form-error" style={{ color: 'var(--success)' }}>{message}</p>}
                <button type="button" className="btn-submit" onClick={handleAuth} disabled={loading || !email || !password}>
                  {loading ? 'Please wait…' : 'Create free account'}
                </button>
              </div>

              <p className="switch-text">
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')}>Log in</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-layout"><div className="right-panel"><p>Loading…</p></div></div>}>
      <LoginContent />
    </Suspense>
  )
}
