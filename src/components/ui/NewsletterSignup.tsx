'use client'

import { useState } from 'react'

interface NewsletterSignupProps {
  variant?: 'dark' | 'light' | 'card'
}

export default function NewsletterSignup({ variant = 'dark' }: NewsletterSignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      } else {
        setStatus('success')
        setMessage(data.message || "You're in! Check your inbox.")
        setName('')
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  const isDark = variant === 'dark'
  const isCard = variant === 'card'

  const wrapperClass =
    variant === 'dark'
      ? 'bg-[#111111] text-white'
      : variant === 'card'
        ? 'bg-white text-[#1A1A1A] rounded-2xl border border-gray-100 shadow-premium'
        : 'bg-[#FAFAF7] text-[#1A1A1A]'

  const inputClass = isDark
    ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-[#C8A96A] focus:bg-white/15'
    : 'bg-white border border-gray-200 text-[#1A1A1A] placeholder-gray-400 focus:border-[#C8A96A]'

  const subtextClass = isDark ? 'text-white/60' : 'text-gray-500'
  const labelClass = isDark ? 'text-white/80' : 'text-gray-600'

  return (
    <div className={`${wrapperClass} ${isCard ? 'p-8' : 'px-6 py-12 md:px-12 md:py-16'} relative overflow-hidden`}>
      {/* Subtle background ornament */}
      {isDark && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C8A96A 0%, transparent 70%)' }}
        />
      )}

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl" role="img" aria-label="hibiscus">🌺</span>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#C8A96A' }}
            >
              Newsletter
            </span>
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Stay in the loop
          </h2>
          <p className={`text-base ${subtextClass} leading-relaxed`}>
            South Asian wedding tips, vendor spotlights, and exclusive deals — delivered to your inbox.
          </p>
        </div>

        {/* Success State */}
        {status === 'success' && (
          <div
            className="rounded-xl px-6 py-5 animate-fade-up"
            style={{ background: 'rgba(200,169,106,0.12)', border: '1px solid rgba(200,169,106,0.3)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold" style={{ color: '#C8A96A' }}>
                  You&apos;re in!
                </p>
                <p className={`text-sm ${subtextClass}`}>{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={`${inputClass} flex-1 min-w-0 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200`}
                autoComplete="given-name"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={`${inputClass} flex-1 min-w-0 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200`}
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="btn-primary shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: '#C8A96A' }}
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Joining…
                  </span>
                ) : (
                  'Join the List →'
                )}
              </button>
            </div>

            {/* Error message */}
            {status === 'error' && (
              <p className="text-sm text-red-400 mb-3 animate-fade-in">{message}</p>
            )}
          </form>
        )}

        {/* Trust bullets */}
        <div className={`flex flex-wrap gap-x-5 gap-y-1 text-sm ${subtextClass} mt-4`}>
          {[
            { icon: '✓', text: 'Join 1,200+ couples & vendors' },
            { icon: '✓', text: 'Weekly vendor spotlights' },
            { icon: '✓', text: 'Unsubscribe anytime' },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-1.5">
              <span style={{ color: '#C8A96A' }} className="font-bold">
                {icon}
              </span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
