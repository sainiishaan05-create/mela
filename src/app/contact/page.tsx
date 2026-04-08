'use client'

import { useState } from 'react'
import { Mail, Clock, Send, CheckCircle2, Loader2, MapPin } from 'lucide-react'
import Link from 'next/link'

const SUBJECTS = [
  'General Inquiry',
  'Vendor Support',
  'Partnerships',
  'Bug Report',
  'Other',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = 'w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/10 transition-all'

  return (
    <div style={{ background: 'var(--color-bg)' }}>

      {/* Hero */}
      <section className="bg-luxury-dark bg-jali aurora-orbs hero-borderlines relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="hero-gradient-glow" />
        <div className="hero-arcs" />
        <div className="hero-slashes" />
        <div className="hero-side-rails hidden md:block" />
        <div className="hero-hash-top" />
        <div className="hero-hash-bottom" />
        <div className="hero-flourish hero-flourish-tl hidden md:block" />
        <div className="hero-flourish hero-flourish-tr hidden md:block" />
        <div className="hero-flourish hero-flourish-bl hidden md:block" />
        <div className="hero-flourish hero-flourish-br hidden md:block" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="section-label mb-5 justify-center">Contact</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white mb-5">
            Get in Touch
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Questions? Partnerships? Vendor support? Reach us directly.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* Left — Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Reach us directly
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Couples, vendors, partners — all welcome.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { Icon: Mail, label: 'Email', value: 'hello@melaa.ca', href: 'mailto:hello@melaa.ca' },
                { Icon: Clock, label: 'Response Time', value: 'Within 2 hours', href: null },
                { Icon: MapPin, label: 'Serving', value: 'Greater Toronto Area, Ontario', href: null },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="roundel-seal shrink-0">
                    <Icon className="w-4 h-4" style={{ color: 'var(--color-gold-dark)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium hover:underline" style={{ color: 'var(--color-gold-dark)' }}>{value}</a>
                    ) : (
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-taupe)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Follow us</p>
              <div className="flex gap-3">
                <a href="https://instagram.com/melaa.ca_" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-gold-dark)' }}>
                  Instagram
                </a>
                <a href="https://tiktok.com/@melaa.ca" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-gold-dark)' }}>
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <div className="invitation-border p-12 text-center relative">
                <div className="relative z-10">
                  <div className="monogram-seal">M</div>
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    Message Sent
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    We&apos;ll get back to you within 2 hours.
                  </p>
                  <Link href="/" className="text-sm font-semibold hover:underline" style={{ color: 'var(--color-gold-dark)' }}>
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="invitation-border p-8 space-y-5 relative">
                <div className="relative z-10 space-y-5">
                <div className="monogram-seal">M</div>
                <p className="cordially-invited">You are cordially invited to reach out</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Name</label>
                    <input
                      type="text" required placeholder="Your name"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={inputCls} style={{ borderColor: 'var(--color-taupe)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Email</label>
                    <input
                      type="email" required placeholder="you@example.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={inputCls} style={{ borderColor: 'var(--color-taupe)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Subject</label>
                  <select
                    required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className={inputCls} style={{ borderColor: 'var(--color-taupe)' }}
                  >
                    <option value="">Select a topic</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Message</label>
                  <textarea
                    required rows={5} placeholder="How can we help?"
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className={`${inputCls} resize-none`} style={{ borderColor: 'var(--color-taupe)' }}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">Something went wrong. Please try again or email us directly.</p>
                )}

                <button
                  type="submit" disabled={status === 'loading'}
                  className="btn-gold w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
