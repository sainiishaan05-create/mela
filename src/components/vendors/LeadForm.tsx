'use client'

import { useState } from 'react'

interface LeadFormProps {
  vendorId: string
  vendorName: string
}

export default function LeadForm({ vendorId, vendorName }: LeadFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    event_date: '',
    event_type: 'Wedding',
    message: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, vendor_id: vendorId }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-semibold text-gray-800">Inquiry sent!</p>
        <p className="text-sm text-gray-500 mt-1">{vendorName} will get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        type="text"
        placeholder="Your name"
        value={form.buyer_name}
        onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A]"
      />
      <input
        required
        type="email"
        placeholder="Email address"
        value={form.buyer_email}
        onChange={e => setForm(f => ({ ...f, buyer_email: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A]"
      />
      <input
        type="tel"
        placeholder="Phone (optional)"
        value={form.buyer_phone}
        onChange={e => setForm(f => ({ ...f, buyer_phone: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A]"
      />
      <input
        type="date"
        placeholder="Event date"
        value={form.event_date}
        onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A]"
      />
      <select
        value={form.event_type}
        onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A]"
      >
        <option>Wedding</option>
        <option>Engagement</option>
        <option>Mehndi</option>
        <option>Sangeet</option>
        <option>Reception</option>
        <option>Other</option>
      </select>
      <textarea
        required
        placeholder="Tell them about your event..."
        rows={3}
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A96A] resize-none"
      />
      {status === 'error' && <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#C8A96A] text-white font-semibold py-2.5 rounded-lg hover:bg-[#d06a09] transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  )
}
