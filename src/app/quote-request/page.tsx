'use client'

import { useState } from 'react'
import { useQuoteSelection } from '@/components/quotes/QuoteSelectionProvider'
import { X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import FormSelect from '@/components/ui/FormSelect'

export default function QuoteRequestPage() {
  const { selected, toggle, clear, count } = useQuoteSelection()
  const [form, setForm] = useState({
    buyer_name: '', buyer_email: '', buyer_phone: '',
    event_date: '', event_type: 'Wedding', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [sentTo, setSentTo] = useState(0)

  const vendors = [...selected.values()]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (vendors.length === 0) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/leads/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_ids: vendors.map(v => v.id),
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }
      setSentTo(data.sent_to ?? vendors.length)
      clear()
      setStatus('success')
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-gold)' }} />
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Request sent!
          </h1>
          <p className="text-gray-500 mb-6">
            Your quote request was sent to {sentTo} vendor{sentTo !== 1 ? 's' : ''}. They usually reply within 24 hours.
          </p>
          <Link href="/vendors" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#C8A96A] text-white hover:opacity-90 transition-opacity">
            Browse more vendors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center max-w-md">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            No vendors selected
          </h1>
          <p className="text-gray-500 mb-6">
            Go to the vendor directory, tap the checkboxes on up to 3 vendors, and come back here.
          </p>
          <Link href="/vendors" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#C8A96A] text-white hover:opacity-90 transition-opacity">
            Browse vendors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm bg-[#FAFAF7] text-[#1A1A1A] outline-none focus:border-[#C8A96A] transition-colors'

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--color-gold-dark)' }}>
            Quote request
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Get quotes from {count} vendor{count !== 1 ? 's' : ''}
          </h1>
        </div>

        {/* Selected vendor pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {vendors.map(v => (
            <div
              key={v.id}
              className="flex items-center gap-2 px-3 py-2 rounded-full border text-sm"
              style={{ borderColor: 'var(--color-taupe)', background: 'white' }}
            >
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{v.name}</span>
              {v.categoryName && (
                <span className="text-xs text-gray-400">{v.categoryName}</span>
              )}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={`Remove ${v.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 sm:p-8 space-y-5" style={{ borderColor: 'var(--color-taupe)' }}>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Your name</label>
            <input type="text" required value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} placeholder="Full name" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Email</label>
            <input type="email" required value={form.buyer_email} onChange={e => setForm(f => ({ ...f, buyer_email: e.target.value }))} placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Phone (optional)</label>
            <input type="tel" value={form.buyer_phone} onChange={e => setForm(f => ({ ...f, buyer_phone: e.target.value }))} placeholder="416-555-1234" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Event date</label>
              <input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Event type</label>
              <FormSelect value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} variant="cream">
                <option>Wedding</option>
                <option>Engagement</option>
                <option>Mehndi</option>
                <option>Sangeet</option>
                <option>Reception</option>
                <option>Other</option>
              </FormSelect>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Message</label>
            <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell them about your event, what you're looking for, your guest count, etc." className={`${inputCls} resize-none`} />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#C8A96A] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-base flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
            ) : (
              <>Send to {count} vendor{count !== 1 ? 's' : ''} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
