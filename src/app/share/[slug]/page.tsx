import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import HideChrome from './HideChrome'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('name')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return {
    title: vendor ? `${vendor.name} | Find us on Melaa` : 'Share | Melaa',
  }
}

export default async function ShareCardPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('name, slug, category:categories(name, icon), city:cities(name)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!vendor) notFound()

  // Supabase joins may return an object or an array depending on the relation
  const rawCat = vendor.category
  const rawCity = vendor.city
  const cat = (Array.isArray(rawCat) ? rawCat[0] : rawCat) as { name: string; icon: string | null } | null
  const city = (Array.isArray(rawCity) ? rawCity[0] : rawCity) as { name: string } | null

  return (
    <div className="min-h-screen bg-[#0A0808] flex items-center justify-center p-4">
      <HideChrome />
      {/* Instagram Story aspect ratio: 1080×1920 = 9:16 */}
      <div
        className="relative overflow-hidden flex flex-col items-center justify-between text-center"
        style={{
          width: 360,
          height: 640,
          borderRadius: 24,
          background: 'linear-gradient(180deg, #0D0B09 0%, #1A1613 40%, #0D0B09 100%)',
          boxShadow: '0 0 80px rgba(200,169,106,0.08)',
        }}
      >
        {/* Subtle gold radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500,
            height: 500,
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(200,169,106,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Top ornamental line */}
        <div className="relative z-10 w-full flex flex-col items-center pt-14">
          <div className="w-16 h-px mb-6" style={{ background: 'rgba(200,169,106,0.4)' }} />
          <p
            className="text-[10px] font-bold uppercase tracking-[0.35em] mb-1"
            style={{ color: 'rgba(200,169,106,0.7)' }}
          >
            Trusted vendor on
          </p>
          <h2
            className="font-[family-name:var(--font-playfair)] text-4xl font-bold"
            style={{ color: '#C8A96A' }}
          >
            Melaa
          </h2>
          <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            South Asian Wedding & Event Vendors
          </p>
        </div>

        {/* Center: vendor name */}
        <div className="relative z-10 px-8 flex flex-col items-center">
          {/* Category icon */}
          {cat?.icon && (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
              style={{
                background: 'rgba(200,169,106,0.08)',
                border: '1px solid rgba(200,169,106,0.2)',
              }}
            >
              {cat.icon}
            </div>
          )}

          <h1
            className="font-[family-name:var(--font-playfair)] text-[28px] font-bold leading-tight mb-3"
            style={{ color: '#FFFFFF' }}
          >
            {vendor.name}
          </h1>

          {(cat || city) && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {cat?.name}
              {cat && city ? ' · ' : ''}
              {city?.name}
            </p>
          )}

          {/* Divider */}
          <div
            className="w-10 h-px my-6"
            style={{ background: 'rgba(200,169,106,0.35)' }}
          />

          <p
            className="text-base font-semibold"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Find us on{' '}
            <span style={{ color: '#C8A96A' }}>melaa.ca</span>
          </p>
        </div>

        {/* Bottom */}
        <div className="relative z-10 w-full flex flex-col items-center pb-12">
          <div
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
            style={{
              background: 'rgba(200,169,106,0.1)',
              border: '1px solid rgba(200,169,106,0.25)',
              color: '#C8A96A',
            }}
          >
            melaa.ca/vendors/{vendor.slug}
          </div>
          <div className="w-16 h-px mt-8" style={{ background: 'rgba(200,169,106,0.25)' }} />
        </div>
      </div>

      {/* Instruction text below the card */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Screenshot this card and share it on your Instagram Story
        </p>
      </div>
    </div>
  )
}
