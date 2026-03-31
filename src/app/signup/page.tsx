'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Sign up failed. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-[0_4px_24px_rgba(26,26,26,0.08)] text-center">
          <p className="text-5xl mb-4">📬</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            Check your email
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back to log in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#C8A96A] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#B8945A] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-[0_4px_24px_rgba(26,26,26,0.08)]">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#C8A96A]">
            Mela
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mt-3">
            Create your vendor account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Free to join — claim your listing and start getting leads
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-[#FAFAF7] text-[#1A1A1A] outline-none focus:border-[#C8A96A] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-[#FAFAF7] text-[#1A1A1A] outline-none focus:border-[#C8A96A] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-[#FAFAF7] text-[#1A1A1A] outline-none focus:border-[#C8A96A] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C8A96A] hover:bg-[#B8945A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Steps hint */}
        <div className="mt-8 bg-[#F5ECD7]/50 rounded-xl p-4">
          <p className="text-xs font-bold text-[#C8A96A] uppercase tracking-widest mb-3">How it works</p>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C8A96A] text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
              Create your free account
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C8A96A] text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
              Find your business in the Mela directory
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C8A96A] text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
              Claim your listing — edit photos, description &amp; more
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C8A96A] text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">4</span>
              Start receiving inquiries from couples
            </li>
          </ol>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C8A96A] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
