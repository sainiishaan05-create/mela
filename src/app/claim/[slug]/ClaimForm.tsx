'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'

interface ClaimFormProps {
  slug: string
  vendorName: string
}

export default function ClaimForm({ slug, vendorName }: ClaimFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/claim/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1A1A1A] mb-2">
          Check your inbox!
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          We sent a verification link to{' '}
          <strong className="text-[#1A1A1A]">{email}</strong>.
          <br />
          Click it to verify your email and continue claiming{' '}
          <strong className="text-[#1A1A1A]">{vendorName}</strong>.
        </p>
        <p className="text-xs text-gray-400 mt-3">Link expires in 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
          Your business email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/30 focus:border-[#C8A96A] text-sm transition"
          disabled={status === 'loading'}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !email.trim()}
        className="w-full flex items-center justify-center gap-2 bg-[#C8A96A] hover:bg-[#d16a09] text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Send Verification Link
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}
