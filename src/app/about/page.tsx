import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Shield, Zap, ArrowRight, Sparkles, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'About Melaa | Our Story | South Asian Wedding Vendors GTA',
  description: 'Melaa was built for South Asian families in the GTA who deserve vendors that understand their culture, traditions, and celebrations.',
}

const VALUES = [
  { Icon: Heart, title: 'South Asian First', desc: 'Every vendor on Melaa understands your traditions, ceremonies, and celebrations. No explaining, no compromises.' },
  { Icon: Zap, title: 'Zero Fees, Always', desc: 'Couples browse and contact vendors for free. No booking fees, no commissions, no hidden costs. Ever.' },
  { Icon: Users, title: 'Community Driven', desc: 'Built by and for the South Asian community in the GTA. Your feedback shapes everything we build.' },
]

export default async function AboutPage() {
  const supabase = await createClient()
  const [{ count: vendorCount }, { count: cityCount }, { count: categoryCount }] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('cities').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  return (
    <div style={{ background: 'var(--color-bg)' }}>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6" style={{ background: 'var(--color-bg-dark)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center top, rgba(200,169,106,0.18) 0%, transparent 70%)',
        }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#C8A96A' }}>Our Story</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5">
            Built for <span className="gradient-text">your culture.</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Melaa exists because South Asian families in the GTA deserve a platform that understands their celebrations from the inside out.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          Why Melaa Exists
        </h2>
        <div className="space-y-5 text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          <p>
            Planning a South Asian wedding in the GTA should be exciting, not exhausting. But for too many families,
            the process means scrolling through generic directories full of vendors who have never seen a baraat, have
            no idea what a mandap is, and cannot tell the difference between a Sangeet and a reception.
          </p>
          <p>
            Melaa was started to fix that. We are building the only vendor directory in the Greater Toronto Area that
            is designed from day one for South Asian weddings and events. Every vendor listed here knows your rituals,
            your food, your music, and your expectations, because they come from the same community you do.
          </p>
          <p>
            We believe couples should be able to find photographers who have shot a hundred pheras, caterers who know
            the difference between a Gujarati thali and a Punjabi spread, and decorators who can build a mandap that
            takes your breath away, all without leaving one platform.
          </p>
          <p>
            That is Melaa. Built for your culture. Not adapted for it.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-center mb-10" style={{ color: 'var(--color-text)' }}>
          What We Believe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map(({ Icon, title, desc }) => (
            <div key={title} className="bento-card p-7 text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--color-gold-light)' }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--color-gold-dark)' }} />
              </div>
              <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y py-12 px-6" style={{ borderColor: 'var(--color-taupe)', background: 'white' }}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-12">
          {[
            { val: (vendorCount ?? 1200).toLocaleString() + '+', label: 'Verified Vendors' },
            { val: (cityCount ?? 55) + '+', label: 'Ontario Cities' },
            { val: (categoryCount ?? 33) + '+', label: 'Categories' },
            { val: '$0', label: 'Booking Fees' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold" style={{ color: 'var(--color-gold-dark)' }}>{val}</p>
              <p className="text-xs tracking-wide mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          Ready to find your perfect vendor?
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Browse {(vendorCount ?? 1200).toLocaleString()}+ vendors across the GTA, completely free.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/vendors" className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Browse Vendors
          </Link>
          <Link href="/list-your-business" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold border transition-colors hover:border-[#C8A96A] hover:text-[#C8A96A]" style={{ borderColor: 'var(--color-taupe)', color: 'var(--color-text)' }}>
            List Your Business
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
