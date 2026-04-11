'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Category, City } from '@/types'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import FormSelect from '@/components/ui/FormSelect'

interface Props {
  categories: Category[]
  cities: City[]
}

export default function VendorSignupForm({ categories, cities }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [authedEmail, setAuthedEmail] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', category_id: '', city_id: '',
  })

  // Detect an existing session so we can shortcut to /onboarding/vendor
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setAuthedEmail(data.user?.email ?? null)
      setAuthChecked(true)
    })
  }, [])

  async function handleSwitchAccount() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthedEmail(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (form.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          category_id: form.category_id,
          city_id: form.city_id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      // Auto-login so they land in their dashboard
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError) {
        console.warn('Auto-login failed after signup:', signInError.message)
        setStatus('success')
        return
      }

      // Hard redirect so browser sends the auth cookie
      window.location.href = '/dashboard?claimed=1'
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">You&apos;re listed!</h2>
        <p className="text-gray-500 mb-6">Your business is now live on Melaa. Log in to complete your profile and start getting leads.</p>
        <a
          href="/login"
          className="inline-block bg-[#C8A96A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#B8945A] transition-colors"
        >
          Log in to your dashboard →
        </a>
      </div>
    )
  }

  // If the visitor is already signed in, shortcut them straight to onboarding
  // (prevents the "email already exists" bug from filling the form twice).
  if (authChecked && authedEmail) {
    return (
      <div className="space-y-4">
        <div className="p-5 rounded-2xl border border-[#C8A96A]/25 bg-[#FFFDF7]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C8A96A] mb-1">
            Signed in
          </p>
          <p className="text-sm text-gray-700 mb-4">
            as <span className="font-semibold text-[#1A1A1A]">{authedEmail}</span>
          </p>
          <a
            href="/onboarding/vendor"
            className="w-full bg-[#C8A96A] text-white font-semibold py-3.5 rounded-xl hover:bg-[#B8945A] transition-colors text-base flex items-center justify-center gap-2"
          >
            Complete your vendor listing <ArrowRight className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="mt-3 w-full text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            Not you? Use a different account
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-1">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> No credit card</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live in 30 seconds</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Cancel anytime</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-[#C8A96A] text-white text-xs font-bold flex items-center justify-center">1</span>
          <span className="text-xs font-semibold text-[#C8A96A]">Create account</span>
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div className="flex items-center gap-1.5 opacity-40">
          <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center">2</span>
          <span className="text-xs font-medium text-gray-400">Complete profile</span>
        </div>
      </div>

      {/* Fast path — Google (takes vendors straight to a lightweight onboarding page) */}
      <GoogleSignInButton
        next="/onboarding/vendor"
        label="Continue with Google"
      />

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">or use email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
        <input
          type="text"
          required
          placeholder="e.g. Royal Photography"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Repeat password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <FormSelect
          required
          value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          variant="white"
        >
          <option value="">What do you do?</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </FormSelect>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
        <FormSelect
          required
          value={form.city_id}
          onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))}
          variant="white"
        >
          <option value="">Where are you based?</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </FormSelect>
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#C8A96A] text-white font-semibold py-3.5 rounded-xl hover:bg-[#B8945A] transition-colors disabled:opacity-60 text-base flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creating your listing...</>
        ) : (
          <>Get Listed Free <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-1">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> No credit card</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live in 30 seconds</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Cancel anytime</span>
        </div>
      </form>
    </div>
  )
}
