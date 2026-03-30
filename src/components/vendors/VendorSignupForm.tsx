'use client'

import { useState } from 'react'
import type { Category, City } from '@/types'

interface Props {
  categories: Category[]
  cities: City[]
}

export default function VendorSignupForm({ categories, cities }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', category_id: '', city_id: '',
    description: '', website: '', instagram: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">You're listed!</h2>
        <p className="text-gray-500">Your business is now live on Melaa. Buyers can start finding you right away.</p>
      </div>
    )
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Business Name *', 'name', 'text', 'e.g. Royal Photography')}
      {field('Email Address *', 'email', 'email', 'you@example.com')}
      {field('Phone Number', 'phone', 'tel', '+1 (416) 000-0000')}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select
          required
          value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
        >
          <option value="">Select a category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
        <select
          required
          value={form.city_id}
          onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]"
        >
          <option value="">Select a city</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">About Your Business</label>
        <textarea
          rows={4}
          placeholder="Describe your services, experience, and what makes you special..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] resize-none"
        />
      </div>

      {field('Website', 'website', 'url', 'https://yourwebsite.com')}
      {field('Instagram', 'instagram', 'text', '@yourhandle')}

      {status === 'error' && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#C8A96A] text-white font-semibold py-3 rounded-xl hover:bg-[#d06a09] transition-colors disabled:opacity-60 text-base"
      >
        {status === 'loading' ? 'Submitting...' : 'List My Business Free →'}
      </button>
      <p className="text-xs text-center text-gray-400">No credit card required. Your listing goes live immediately.</p>
    </form>
  )
}
