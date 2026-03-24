'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred.')
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
              onFocus={(e) => (e.currentTarget.style.borderColor = '#E8760A')}
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
              onFocus={(e) => (e.currentTarget.style.borderColor = '#E8760A')}
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
              backgroundColor: loading ? '#c4620a' : '#E8760A',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
