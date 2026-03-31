'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Please try again.'
            : signInError.message
        )
        return
      }

      // Refresh server components so middleware picks up the new session
      router.refresh()
      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAF7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 24px rgba(26,26,26,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: '#C8A96A', textDecoration: 'none' }}>
            Mela
          </Link>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '0.25rem',
            textAlign: 'center',
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#6b6b6b',
            fontSize: '0.95rem',
            marginBottom: '2rem',
          }}
        >
          Sign in to your Mela vendor account
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1A1A1A',
                marginBottom: '0.5rem',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                fontSize: '1rem',
                border: '1.5px solid #d1d1d1',
                borderRadius: '8px',
                outline: 'none',
                color: '#1A1A1A',
                backgroundColor: '#FAFAF7',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C8A96A')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d1d1')}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1A1A1A',
                marginBottom: '0.5rem',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                fontSize: '1rem',
                border: '1.5px solid #d1d1d1',
                borderRadius: '8px',
                outline: 'none',
                color: '#1A1A1A',
                backgroundColor: '#FAFAF7',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C8A96A')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d1d1')}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: '0.875rem',
                color: '#c0392b',
                marginBottom: '1.25rem',
                textAlign: 'center',
                background: '#fff5f5',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.625rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#FAFAF7',
              backgroundColor: loading ? '#b8945a' : '#C8A96A',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <Link href="/forgot-password" style={{ fontSize: '0.875rem', color: '#C8A96A', textDecoration: 'none' }}>
            Forgot your password?
          </Link>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b6b6b' }}>
          Don&apos;t have an account?{' '}
          <Link href="/list-your-business" style={{ color: '#C8A96A', fontWeight: 600, textDecoration: 'none' }}>
            List your business free
          </Link>
        </div>
      </div>
    </div>
  )
}
