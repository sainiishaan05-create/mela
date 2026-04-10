'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  /** Optional path to redirect to after successful sign-in. If omitted, /auth/callback routes automatically based on vendor match. */
  next?: string
  /** Visual variant — 'light' for white-on-gray, 'dark' for dark mode backgrounds. Default: 'light'. */
  variant?: 'light' | 'dark'
  /** Label override. Default: 'Continue with Google'. */
  label?: string
  /** Full width? Default: true. */
  fullWidth?: boolean
}

export default function GoogleSignInButton({
  next,
  variant = 'light',
  label = 'Continue with Google',
  fullWidth = true,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const callbackUrl = next
        ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
        : `${origin}/auth/callback`

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (authError) {
        setError('Could not connect to Google. Please try again.')
        setLoading(false)
      }
      // On success, the browser redirects to Google — no further action needed here
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const baseClasses = `
    flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold
    transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `

  const variantClasses =
    variant === 'dark'
      ? 'bg-white/95 hover:bg-white text-gray-800 border border-white/20 hover:shadow-lg'
      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`${baseClasses} ${variantClasses}`}
        aria-label={label}
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <GoogleLogo />
        )}
        <span>{loading ? 'Signing in…' : label}</span>
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/* Google "G" logo — official brand SVG */
function GoogleLogo() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}
