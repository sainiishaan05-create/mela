import type { Metadata } from 'next'
import VendorSignupForm from '@/components/vendors/VendorSignupForm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Sparkles, Shield, Zap, TrendingUp, Users, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'List Your Business Free | Melaa | Wedding & Event Vendors GTA',
  description: 'Join as a Founding Vendor on Melaa. Free for 90 days. First 50 vendors get the exclusive $49/mo rate. Get discovered by thousands of South Asian families in the GTA.',
}

// Real testimonials only — do not add placeholder/fabricated quotes here
const SOCIAL_PROOF: { initials: string; name: string; role: string; text: string }[] = []

const FEATURES = [
  { icon: '📍', title: 'GTA-Focused Discovery', desc: 'Appear in searches by couples in your exact city, not buried under national chains.' },
  { icon: '📩', title: 'Direct Couple Inquiries', desc: 'Leads come straight to your inbox. No middlemen, no platform fees on bookings.' },
  { icon: '🏆', title: 'Verified Vendor Badge', desc: 'Stand out with a verified badge that builds instant trust with couples.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'See exactly how many couples viewed your profile and where they came from.' },
  { icon: '🤖', title: 'AI Reply Suggestions', desc: 'Get AI-drafted responses to inquiries so you never miss a lead.' },
  { icon: '🔒', title: 'Exclusive Founding Rate', desc: 'Only the first 50 vendors get the $49/mo rate. Claim your spot before they\'re gone.' },
]

export default async function ListYourBusinessPage() {
  const supabase = await createClient()
  const [{ data: categories }, { data: cities }, { count: vendorCount }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Spots left is intentionally not shown — the old calc (50 - total vendors) was broken
  const spotsLeft = 0
  const count = vendorCount?.toLocaleString() ?? '1,200'

  return (
    <div style={{ background: 'var(--color-bg)' }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6" style={{ background: 'var(--color-bg-dark)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center top, rgba(200,169,106,0.18) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Urgency badge */}
          {spotsLeft > 0 && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-8"
              style={{ borderColor: 'rgba(200,169,106,0.3)', background: 'rgba(200,169,106,0.08)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--color-gold)' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--color-gold)' }} />
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
                Only <strong>{spotsLeft} founding spots</strong> left at $49/mo
              </span>
            </div>
          )}

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6">
            Get Found by Couples<br />
            <span className="gradient-text">Ready to Book</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            South Asian weddings are a <strong className="text-white">$2B+ market in Canada</strong>. Your ideal clients are already searching on Mela. Be where they look.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            {[
              { val: count + '+', label: 'Active Vendors' },
              { val: '55+', label: 'Ontario Cities' },
              { val: '$0', label: 'Booking Fees' },
              { val: '90', label: 'Days Free Trial' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold)' }}>{val}</div>
                <div className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* CTA scroll hint */}
          <a href="#signup" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold">
            <Sparkles className="w-4 h-4" />
            Claim Your Free Spot
          </a>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="border-y py-6 px-4" style={{ borderColor: 'var(--color-taupe)', background: 'var(--color-section)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SOCIAL_PROOF.map(({ initials, name, role, text }) => (
            <div key={name} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--color-gold-light)', color: 'var(--color-gold-dark)' }}>
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{name} · <span style={{ color: 'var(--color-text-muted)' }}>{role}</span></p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>"{text}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT: 2-col ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Features + Timeline */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>What You Get</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold mb-8" style={{ color: 'var(--color-text)' }}>
              Everything you need to<br />grow your wedding business
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {FEATURES.map(({ icon, title, desc }) => (
                <div key={title} className="bento-card p-5">
                  <span className="text-2xl mb-3 block">{icon}</span>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--color-taupe)', background: 'white' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--color-gold-dark)' }}>What Happens Next</p>
              <div className="space-y-5">
                {[
                  { day: 'Today', icon: '🚀', text: 'Profile goes live. Couples in the GTA can find and contact you immediately.' },
                  { day: 'Days 1–90', icon: '📩', text: 'Receive leads completely free. We prove our value before you pay a cent.' },
                  { day: 'Day 90', icon: '🔒', text: 'Founding Members continue at $49/mo. Only 50 spots available at this rate.' },
                  { day: 'Ongoing', icon: '📈', text: 'Priority placement, verified badge, unlimited leads, full analytics.' },
                ].map(({ day, icon, text }) => (
                  <div key={day} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{ background: 'var(--color-gold-light)' }}>
                        {icon}
                      </div>
                      <div className="w-px flex-1 mt-2" style={{ background: 'var(--color-taupe)' }} />
                    </div>
                    <div className="pb-5">
                      <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-gold-dark)' }}>{day}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee */}
            <div className="mt-6 rounded-2xl border-2 p-6 flex gap-4" style={{ borderColor: 'var(--color-gold)', background: 'var(--color-gold-light)' }}>
              <span className="text-3xl shrink-0">🛡️</span>
              <div>
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-text)' }}>Our Lead Guarantee</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  If you don't receive at least one genuine inquiry in your first 90 days, we'll personally work with your profile until you do, or you owe us nothing.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div id="signup" className="lg:sticky lg:top-24">
            {/* Pricing card */}
            <div className="rounded-2xl border-2 p-6 mb-4 text-center" style={{ borderColor: 'var(--color-gold)', background: 'var(--color-bg-dark)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-gold)' }}>Founding Vendor Program</p>
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-5xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold)' }}>$0</span>
                <span className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>for 90 days</span>
              </div>
              <p className="text-sm text-white mb-3">Then <strong style={{ color: 'var(--color-gold)' }}>$49/mo</strong> for the first 50 vendors. No credit card needed</p>
              <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> No card required</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Cancel anytime</span>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--color-taupe)', background: 'white' }}>
              <VendorSignupForm categories={categories ?? []} cities={cities ?? []} />
            </div>

            <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
              Already listed? <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-gold-dark)' }}>Log in to your dashboard →</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
