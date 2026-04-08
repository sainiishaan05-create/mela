'use client'

import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'
import type { Category, City } from '@/types'
import FormSelect from '@/components/ui/FormSelect'

interface Props {
  categories: Category[]
  cities: City[]
}

/**
 * Lightweight vendor onboarding form — shown to vendors who are ALREADY signed
 * in (via Google or email). Only captures business name + category + city.
 *
 * Calls /api/vendors/onboard which uses the existing session, so there's no
 * duplicate-email conflict with supabase.auth.admin.createUser.
 */
export default function VendorOnboardingForm({ categories, cities }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ name: '', category_id: '', city_id: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setStatus('loading')
    try {
      const res = await fetch('/api/vendors/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        // Graceful routing: if already has a listing, send to dashboard
        if (res.status === 409 && data.redirect) {
          window.location.href = data.redirect
          return
        }
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      // Success — hard-redirect to vendor dashboard with freshly-linked session
      window.location.href = '/dashboard?claimed=1'
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
          Business name
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Royal Photography"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-[#FAFAF7] text-[#1A1A1A] outline-none focus:border-[#C8A96A] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
          What do you do?
        </label>
        <FormSelect
          required
          value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
        >
          <option value="">Select a category…</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
          Where are you based?
        </label>
        <FormSelect
          required
          value={form.city_id}
          onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))}
        >
          <option value="">Select a city…</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FormSelect>
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#C8A96A] text-white font-semibold py-4 rounded-xl hover:bg-[#B8945A] transition-colors disabled:opacity-60 text-base flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Creating your listing…
          </>
        ) : (
          <>
            Get listed free <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        You can add photos, description, and contact info from your dashboard next.
      </p>
    </form>
  )
}
