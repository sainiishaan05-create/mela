'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setStatus('error'); return }
      setStatus('sent')
    } catch {
      setError('An unexpected error occurred.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-5xl mb-4">📬</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">Check your inbox</h1>
          <p className="text-gray-500 text-sm mb-6">
            We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
          </p>
          <Link href="/login" className="text-sm text-[#C8A96A] font-medium hover:underline">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-1 text-center">Reset password</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" />
          </div>
          {status === 'error' && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={status === 'loading'}
            className="w-full bg-[#C8A96A] text-white font-semibold py-3 rounded-xl hover:bg-[#B8945A] transition-colors disabled:opacity-60">
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Remember it? <Link href="/login" className="text-[#C8A96A] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
