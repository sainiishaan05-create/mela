'use client'

import { useState, useEffect } from 'react'
import NewsletterSignup from './NewsletterSignup'

export default function NewsletterTab() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  if (!mounted) return null

  return (
    <>
      {/* Backdrop overlay (mobile friendly) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Floating tab trigger (hidden when panel is open) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open newsletter signup"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 rounded-l-2xl px-2.5 py-5 cursor-pointer shadow-saffron transition-all duration-300 hover:px-3.5 group"
          style={{ background: '#E8760A' }}
        >
          {/* Envelope icon */}
          <svg
            className="w-4 h-4 text-white opacity-90 group-hover:opacity-100 transition-opacity"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>

          {/* Vertical "Updates" text */}
          <span
            className="text-white text-xs font-semibold tracking-widest uppercase select-none"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            Updates
          </span>
        </button>
      )}

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Newsletter signup"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-80 bg-white rounded-l-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{
          transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease',
          transform: open ? 'translateX(0) translateY(-50%)' : 'translateX(320px) translateY(-50%)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4 pb-0">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close newsletter panel"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Newsletter form — compact variant inside panel */}
        <div className="px-6 pb-6 pt-2">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" role="img" aria-label="hibiscus">🌺</span>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#E8760A' }}
              >
                Newsletter
              </span>
            </div>
            <h3
              className="text-lg font-bold text-[#1A1A1A] mb-1"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Stay in the loop
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Vendor spotlights, planning tips, and exclusive deals — free.
            </p>
          </div>
          <PanelForm />
          <div className="flex flex-col gap-1 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span style={{ color: '#E8760A' }} className="font-bold">✓</span>
              1,200+ couples & vendors
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: '#E8760A' }} className="font-bold">✓</span>
              Unsubscribe anytime
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/** Compact inline form used inside the floating panel */
function PanelForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong.')
      } else {
        setStatus('success')
        setEmail('')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-xl px-4 py-3 animate-fade-up text-center"
        style={{ background: 'rgba(232,118,10,0.1)', border: '1px solid rgba(232,118,10,0.25)' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#E8760A' }}>
          🎉 You&apos;re subscribed!
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Welcome to Melaa.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="w-full rounded-xl px-4 py-2.5 text-sm border border-gray-200 text-[#1A1A1A] placeholder-gray-400 focus:border-[#E8760A] outline-none transition-colors"
      />
      {status === 'error' && (
        <p className="text-xs text-red-500 animate-fade-in">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className="btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: '#E8760A' }}
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Joining…
          </span>
        ) : (
          'Join the List →'
        )}
      </button>
    </form>
  )
}
