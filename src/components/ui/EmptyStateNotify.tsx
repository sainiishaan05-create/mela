'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, Bell } from 'lucide-react'
import Link from 'next/link'

interface Props {
  icon: string
  title: string
  subtitle: string
  citySlug?: string
}

export default function EmptyStateNotify({ icon, title, subtitle, citySlug }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          city: citySlug ?? '',
          source: 'empty-state',
        }),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-5">{icon}</div>
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">{subtitle}</p>

      {status === 'success' ? (
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-5 py-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4" />
          We&apos;ll notify you when new vendors join!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto mb-6">
          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-center gap-1.5">
            <Bell className="w-3 h-3 text-[#C8A96A]" />
            Get notified when vendors join this area
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#C8A96A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#B8945A] transition-colors disabled:opacity-60 shrink-0"
            >
              {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Notify Me'}
            </button>
          </div>
          {status === 'error' && <p className="text-xs text-red-500 mt-2">Something went wrong. Try again.</p>}
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
        <Link href="/vendors" className="inline-block border border-gray-200 text-gray-600 px-5 py-2.5 rounded-full text-sm font-medium hover:border-gray-300 transition-colors">
          Browse All Vendors
        </Link>
        <Link href="/list-your-business" className="inline-block bg-[#C8A96A] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#B8945A] transition-colors">
          List Your Business Free
        </Link>
      </div>
    </div>
  )
}
