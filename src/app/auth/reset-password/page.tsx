'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Exchange the code from the URL for a session
    const code = searchParams.get('code')
    if (!code) { setError('Invalid reset link. Please request a new one.'); return }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError('Reset link is invalid or expired. Please request a new one.')
      else setSessionReady(true)
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setStatus('error'); return }
    setStatus('success')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <p className="text-4xl mb-3">✅</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">Password updated!</h2>
        <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
      </div>
    )
  }

  if (error && !sessionReady) {
    return (
      <div className="text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <Link href="/forgot-password" className="text-[#C8A96A] font-medium hover:underline text-sm">Request new link</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters" autoComplete="new-password"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat your password" autoComplete="new-password"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={status === 'loading' || !sessionReady}
        className="w-full bg-[#C8A96A] text-white font-semibold py-3 rounded-xl hover:bg-[#B8945A] transition-colors disabled:opacity-60">
        {status === 'loading' ? 'Updating...' : 'Set New Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-1 text-center">Set new password</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Choose a strong password for your account.</p>
        <Suspense fallback={<div className="text-center text-gray-400 text-sm">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
