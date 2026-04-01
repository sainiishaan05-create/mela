'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

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
        setLoading(false)
        return
      }

      // Hard redirect so the browser sends the new auth cookie with the
      // request — client-side router.push() races the middleware cookie check
      window.location.href = next
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-[0_4px_24px_rgba(26,26,26,0.08)]">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#C8A96A]">
            Melaa
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mt-3">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to your Melaa account
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
              placeholder="you@example.com"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-[#FAFAF7] text-[#1A1A1A] outline-none focus:border-[#C8A96A] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A]">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#C8A96A] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-[#FAFAF7] text-[#1A1A1A] outline-none focus:border-[#C8A96A] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C8A96A] hover:bg-[#B8945A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Sign up options */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500 mb-4">Don&apos;t have an account?</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/signup"
              className="flex flex-col items-center gap-1 px-3 py-3.5 rounded-xl border border-gray-200 hover:border-[#C8A96A] hover:bg-[#F5ECD7]/40 transition-all text-center group"
            >
              <span className="text-xl">💍</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-[#C8A96A] transition-colors">I&apos;m a Couple</span>
              <span className="text-[10px] text-gray-400">Save vendors &amp; leave reviews</span>
            </Link>
            <Link
              href="/list-your-business"
              className="flex flex-col items-center gap-1 px-3 py-3.5 rounded-xl border border-gray-200 hover:border-[#C8A96A] hover:bg-[#F5ECD7]/40 transition-all text-center group"
            >
              <span className="text-xl">🏪</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-[#C8A96A] transition-colors">I&apos;m a Vendor</span>
              <span className="text-[10px] text-gray-400">List &amp; manage my business</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
