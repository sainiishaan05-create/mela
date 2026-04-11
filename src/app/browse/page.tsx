import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import NewsletterSignup from '@/components/ui/NewsletterSignup'

export const metadata: Metadata = {
  title: 'Browse by City | Melaa | Wedding & Event Vendors Ontario',
  description: 'Find South Asian wedding & event vendors across 55+ Ontario cities. Browse photographers, caterers, decorators, DJs, and more in your city.',
}

const GTA_CORE = [
  'Toronto', 'Brampton', 'Mississauga', 'Markham', 'Vaughan', 'Scarborough',
  'Richmond Hill', 'Oakville', 'Etobicoke', 'North York', 'Thornhill', 'Woodbridge',
  'Malton', 'Port Credit', 'Streetsville', 'Meadowvale', 'Concord', 'Maple',
]

const SURROUNDING = [
  'Ajax', 'Pickering', 'Oshawa', 'Whitby', 'Bowmanville',
  'Burlington', 'Milton', 'Halton Hills', 'Georgetown',
  'Caledon', 'Bolton', 'King City', 'Kleinburg', 'Nobleton',
  'Newmarket', 'Aurora', 'Bradford', 'East Gwillimbury', 'Innisfil', 'Barrie',
  'Hamilton', 'Brantford', 'Kitchener', 'Waterloo', 'Cambridge', 'Guelph',
  'Stouffville', 'Uxbridge', 'Peterborough',
  'St. Catharines', 'Niagara Falls', 'London', 'Windsor',
]

function citySlug(name: string) {
  return name.toLowerCase().replace(/ /g, '-').replace(/\./g, '')
}

export default function BrowsePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="py-16 px-4 sm:px-6 text-center border-b" style={{ borderColor: 'var(--color-taupe)', background: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>
            Ontario Coverage
          </p>
          <h1
            className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            Browse by City
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#8A7B74' }}>
            Wedding and event vendors across 55+ Ontario cities, all built for your culture.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

        {/* GTA Core */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold-dark)' }}>
              GTA Core
            </p>
            <div className="flex-1 h-px" style={{ background: 'var(--color-taupe)' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GTA_CORE.map(city => (
              <Link
                key={city}
                href={`/city/${citySlug(city)}`}
                className="group card-luxury flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200"
                style={{
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-taupe)',
                  background: 'white',
                }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-gold)' }} />
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Surrounding Areas */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold-dark)' }}>
              Surrounding Areas
            </p>
            <div className="flex-1 h-px" style={{ background: 'var(--color-taupe)' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SURROUNDING.map(city => (
              <Link
                key={city}
                href={`/city/${citySlug(city)}`}
                className="group card-luxury flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200"
                style={{
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-taupe)',
                  background: 'white',
                }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-gold)' }} />
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Email capture for clients */}
        <div className="mb-14">
          <NewsletterSignup variant="card" />
        </div>

        {/* Browse all vendors CTA */}
        <div
          className="rounded-2xl p-8 text-center border"
          style={{ background: 'white', borderColor: 'var(--color-taupe)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-gold-dark)' }}>
            Not sure which city?
          </p>
          <h2
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            Browse all vendors across Ontario
          </h2>
          <p className="text-sm mb-6" style={{ color: '#8A7B74' }}>
            Search by category, filter by city, and find the perfect vendor for your South Asian wedding.
          </p>
          <Link
            href="/vendors"
            className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm"
          >
            Browse All Vendors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
