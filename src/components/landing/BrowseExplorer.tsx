'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ArrowRight, Sparkles, MapPin, Search } from 'lucide-react'

const CATEGORIES = [
  { label: 'Photographers',         slug: 'photographers',         icon: '📸' },
  { label: 'Videographers',         slug: 'videographers',         icon: '🎥' },
  { label: 'Content Creators',      slug: 'content-creators',      icon: '🎬' },
  { label: 'Makeup Artists',        slug: 'makeup-artists',        icon: '💄' },
  { label: 'Mehndi Artists',        slug: 'mehndi-artists',        icon: '🌿' },
  { label: 'Catering',              slug: 'catering',              icon: '🍛' },
  { label: 'Favours & Live Stations', slug: 'favours-live-stations', icon: '🎁' },
  { label: 'Decorators',            slug: 'decorators',            icon: '💐' },
  { label: 'DJs & Entertainment',   slug: 'djs-entertainment',     icon: '🎶' },
  { label: 'Wedding Venues',        slug: 'wedding-venues',        icon: '🏛️' },
  { label: 'Priest Services',       slug: 'priest-services',       icon: '🕉️' },
  { label: 'Bridal Wear',           slug: 'bridal-wear',           icon: '👗' },
]

const CITIES = [
  { name: 'Toronto',       slug: 'toronto' },
  { name: 'Brampton',      slug: 'brampton' },
  { name: 'Mississauga',   slug: 'mississauga' },
  { name: 'Markham',       slug: 'markham' },
  { name: 'Vaughan',       slug: 'vaughan' },
  { name: 'Scarborough',   slug: 'scarborough' },
  { name: 'Richmond Hill', slug: 'richmond-hill' },
  { name: 'Kitchener',     slug: 'kitchener-waterloo' },
]

const STEPS = [
  { num: '01', title: 'Search',  desc: 'Pick a category & city' },
  { num: '02', title: 'Explore', desc: 'View real portfolios' },
  { num: '03', title: 'Connect', desc: 'Reach vendors directly' },
]

const POPULAR = CATEGORIES.slice(0, 6)

export default function BrowseExplorer() {
  const [cat,      setCat]      = useState<string | null>(null)
  const [city,     setCity]     = useState<string | null>(null)
  const [catOpen,  setCatOpen]  = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const router = useRouter()

  const catRef  = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  const onDoc = useCallback((e: MouseEvent) => {
    if (catRef.current  && !catRef.current.contains(e.target as Node))  setCatOpen(false)
    if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false)
  }, [])
  useEffect(() => {
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [onDoc])

  const selectedCat  = CATEGORIES.find(c => c.slug === cat)
  const selectedCity = CITIES.find(c => c.slug === city)

  function go(overrideCat?: string, overrideCity?: string) {
    const c  = overrideCat  ?? cat
    const ci = overrideCity ?? city
    const params = new URLSearchParams()
    if (c)  params.set('category', c)
    if (ci) params.set('city', ci)
    router.push(`/vendors${params.size ? '?' + params.toString() : ''}`)
  }

  return (
    <div className="browse-explorer">

      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="text-center mb-12">
        <div className="divider-gold mx-auto mb-5" />
        <p className="tech-label justify-center mb-3">DISCOVER · GTA VENDORS</p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-white title-glow mb-4">
          Find your perfect vendor
        </h2>
        <p className="text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.40)' }}>
          Browse {CATEGORIES.length}+ categories across 8 GTA cities. No account needed.
        </p>
      </div>

      {/* ── Dual dropdown + CTA ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl mx-auto mb-8">

        {/* Category dropdown */}
        <div ref={catRef} className="relative flex-1">
          <button
            onClick={() => { setCatOpen(o => !o); setCityOpen(false) }}
            className="browse-dropdown w-full"
            aria-expanded={catOpen}
          >
            <span className="browse-dropdown-icon">
              {selectedCat ? selectedCat.icon : <Search className="w-4 h-4" style={{ color: 'rgba(200,169,106,0.55)' }} />}
            </span>
            <span className="browse-dropdown-label">
              {selectedCat ? selectedCat.label : 'All categories'}
            </span>
            <ChevronDown
              className="browse-dropdown-chevron"
              style={{ transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {catOpen && (
            <div className="browse-popover">
              <div className="browse-popover-grid">
                <button
                  className={`browse-popover-item ${!cat ? 'active' : ''}`}
                  onClick={() => { setCat(null); setCatOpen(false) }}
                >
                  <span className="text-base leading-none">✦</span>
                  <span>All Categories</span>
                </button>
                {CATEGORIES.map(c => (
                  <button
                    key={c.slug}
                    className={`browse-popover-item ${cat === c.slug ? 'active' : ''}`}
                    onClick={() => { setCat(c.slug); setCatOpen(false) }}
                  >
                    <span className="text-base leading-none">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* City dropdown */}
        <div ref={cityRef} className="relative flex-1">
          <button
            onClick={() => { setCityOpen(o => !o); setCatOpen(false) }}
            className="browse-dropdown w-full"
            aria-expanded={cityOpen}
          >
            <span className="browse-dropdown-icon">
              <MapPin className="w-4 h-4" style={{ color: selectedCity ? '#C8A96A' : 'rgba(200,169,106,0.55)' }} />
            </span>
            <span className="browse-dropdown-label">
              {selectedCity ? selectedCity.name : 'All GTA cities'}
            </span>
            <ChevronDown
              className="browse-dropdown-chevron"
              style={{ transform: cityOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {cityOpen && (
            <div className="browse-popover">
              <div className="browse-popover-grid browse-popover-grid--cities">
                <button
                  className={`browse-popover-item ${!city ? 'active' : ''}`}
                  onClick={() => { setCity(null); setCityOpen(false) }}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(200,169,106,0.5)' }} />
                  <span>All Cities</span>
                </button>
                {CITIES.map(c => (
                  <button
                    key={c.slug}
                    className={`browse-popover-item ${city === c.slug ? 'active' : ''}`}
                    onClick={() => { setCity(c.slug); setCityOpen(false) }}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(200,169,106,0.5)' }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Explore CTA */}
        <button
          onClick={() => go()}
          className="btn-gold-glow shrink-0 sm:px-6"
          aria-label="Explore vendors"
        >
          <Sparkles className="w-4 h-4" />
          <span className="sm:hidden">Explore</span>
          <span className="hidden sm:inline">Explore</span>
        </button>
      </div>

      {/* ── Quick-access popular chips ─────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mb-14 max-w-2xl mx-auto">
        {POPULAR.map(c => (
          <button
            key={c.slug}
            onClick={() => go(c.slug)}
            className="browse-chip"
          >
            <span className="text-sm leading-none">{c.icon}</span>
            {c.label}
          </button>
        ))}
        <button
          onClick={() => go()}
          className="browse-chip browse-chip--more"
        >
          +{CATEGORIES.length - POPULAR.length} more
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* ── 3-step process strip ───────────────────────────────────────── */}
      <div className="steps-strip">
        {STEPS.map(({ num, title, desc }, i) => (
          <div key={num} className="steps-strip-item">
            {i > 0 && <div className="steps-connector hidden sm:block" />}
            <div className="steps-strip-inner">
              <span className="steps-num">{num}</span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
