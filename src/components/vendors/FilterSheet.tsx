'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check, ArrowRight, Search as SearchIcon } from 'lucide-react'
import type { Category, City } from '@/types'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  cities: City[]
  activeCategory?: string
  activeCity?: string
  activeSort?: string
  activeBadge?: string
  search?: string
}

interface PendingState {
  category: string
  city: string
  sort: string
  badge: string
}

const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'newest', label: 'Newest first' },
]

const BADGE_OPTIONS = [
  { value: '', label: 'All vendors' },
  { value: 'featured', label: 'Featured' },
  { value: 'premium', label: 'Premium' },
  { value: 'verified', label: 'Verified' },
]

export default function FilterSheet({
  isOpen,
  onClose,
  categories,
  cities,
  activeCategory,
  activeCity,
  activeSort,
  activeBadge,
  search,
}: FilterSheetProps) {
  const router = useRouter()
  const [pending, setPending] = useState<PendingState>({
    category: activeCategory ?? '',
    city: activeCity ?? '',
    sort: activeSort ?? '',
    badge: activeBadge ?? '',
  })
  const [citySearch, setCitySearch] = useState('')
  const [liveCount, setLiveCount] = useState<number | null>(null)
  const [isCountLoading, setIsCountLoading] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Reset pending state when sheet opens with new active values
  useEffect(() => {
    if (isOpen) {
      setPending({
        category: activeCategory ?? '',
        city: activeCity ?? '',
        sort: activeSort ?? '',
        badge: activeBadge ?? '',
      })
      setCitySearch('')
      // Focus close button for a11y
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    }
  }, [isOpen, activeCategory, activeCity, activeSort, activeBadge])

  // Body scroll lock while sheet open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [isOpen])

  // Escape key closes sheet
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Live count fetch — debounced
  useEffect(() => {
    if (!isOpen) return
    setIsCountLoading(true)
    const params = new URLSearchParams()
    if (pending.category) params.set('category', pending.category)
    if (pending.city) params.set('city', pending.city)
    if (pending.sort) params.set('sort', pending.sort)
    if (pending.badge) params.set('badge', pending.badge)
    if (search) params.set('search', search)

    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/vendors/count?${params.toString()}`, { signal: ctrl.signal })
        .then(r => r.json())
        .then(d => {
          setLiveCount(typeof d.count === 'number' ? d.count : null)
          setIsCountLoading(false)
        })
        .catch(() => setIsCountLoading(false))
    }, 250)

    return () => { clearTimeout(timer); ctrl.abort() }
  }, [isOpen, pending, search])

  const handleApply = useCallback(() => {
    const params = new URLSearchParams()
    if (pending.category) params.set('category', pending.category)
    if (pending.city) params.set('city', pending.city)
    if (pending.sort) params.set('sort', pending.sort)
    if (pending.badge) params.set('badge', pending.badge)
    if (search) params.set('search', search)
    const qs = params.toString()
    onClose()
    router.push(`/vendors${qs ? `?${qs}` : ''}`)
  }, [pending, search, onClose, router])

  const handleClear = useCallback(() => {
    setPending({ category: '', city: '', sort: '', badge: '' })
    setCitySearch('')
  }, [])

  const filteredCities = citySearch
    ? cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities

  const pendingCount =
    (pending.category ? 1 : 0) +
    (pending.city ? 1 : 0) +
    (pending.sort ? 1 : 0) +
    (pending.badge ? 1 : 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog" aria-label="Filter vendors">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        className="
          absolute bg-white flex flex-col
          bottom-0 left-0 right-0 rounded-t-3xl
          lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:right-auto lg:rounded-3xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-[640px]
          animate-sheet-up lg:animate-sheet-scale
          shadow-[0_-24px_60px_rgba(0,0,0,0.2)] lg:shadow-[0_24px_80px_rgba(0,0,0,0.3)]
        "
        style={{
          height: '100dvh',
          maxHeight: '100dvh',
        }}
      >
        {/* Desktop: constrain height */}
        <style>{`
          @media (min-width: 1024px) {
            [role="dialog"] > div:nth-child(2) {
              height: auto !important;
              max-height: 85dvh !important;
            }
          }
        `}</style>

        {/* Sticky header */}
        <div className="shrink-0 border-b border-gray-100 rounded-t-3xl">
          {/* Drag handle (mobile only) */}
          <div className="pt-2.5 pb-1 flex justify-center lg:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          <div className="flex items-center justify-between px-5 pt-2 pb-3 lg:pt-5 lg:pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C8A96A] mb-0.5">
                Refine your search
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl lg:text-2xl font-bold text-gray-900">
                Filter vendors
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* CATEGORY */}
          <div className="mb-8">
            <h3 className="font-semibold text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-3">
              Category
            </h3>
            <div className="flex flex-wrap gap-2">
              <PillButton
                selected={!pending.category}
                onClick={() => setPending(p => ({ ...p, category: '' }))}
                label="All"
              />
              {categories.map(cat => (
                <PillButton
                  key={cat.slug}
                  selected={pending.category === cat.slug}
                  onClick={() => setPending(p => ({ ...p, category: cat.slug }))}
                  label={cat.name}
                />
              ))}
            </div>
          </div>

          {/* CITY */}
          <div className="mb-8">
            <h3 className="font-semibold text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-3">
              City
            </h3>
            <div className="relative mb-3">
              <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search cities..."
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C8A96A]/20 focus:border-[#C8A96A] outline-none transition-all"
              />
            </div>
            <div className="max-h-60 overflow-y-auto pr-1 -mr-1 space-y-0.5 overscroll-contain">
              <CityRow
                selected={!pending.city}
                onClick={() => setPending(p => ({ ...p, city: '' }))}
                label="All cities"
              />
              {filteredCities.map(c => (
                <CityRow
                  key={c.slug}
                  selected={pending.city === c.slug}
                  onClick={() => setPending(p => ({ ...p, city: c.slug }))}
                  label={c.name}
                />
              ))}
              {filteredCities.length === 0 && (
                <p className="text-sm text-gray-400 px-3 py-2">No cities found</p>
              )}
            </div>
          </div>

          {/* SORT */}
          <div className="mb-8">
            <h3 className="font-semibold text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-3">
              Sort by
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPending(p => ({ ...p, sort: opt.value }))}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border text-left ${
                    pending.sort === opt.value
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* VENDOR TIER */}
          <div className="mb-4">
            <h3 className="font-semibold text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-3">
              Vendor tier
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {BADGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPending(p => ({ ...p, badge: opt.value }))}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border text-left ${
                    pending.badge === opt.value
                      ? 'bg-[#C8A96A]/10 border-[#C8A96A] text-[#C8A96A]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div
          className="shrink-0 bg-white border-t border-gray-100 px-5 pt-4 flex items-center gap-3 rounded-b-none lg:rounded-b-3xl"
          style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)` }}
        >
          <button
            type="button"
            onClick={handleClear}
            disabled={pendingCount === 0}
            className="px-5 py-4 rounded-2xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#C8A96A] text-white font-bold py-4 rounded-2xl shadow-saffron text-sm transition-opacity hover:opacity-90 active:opacity-80 flex items-center justify-center gap-2"
          >
            {isCountLoading || liveCount === null
              ? 'Apply filters'
              : liveCount === 0
                ? 'No vendors match'
                : `Show ${liveCount.toLocaleString()} vendor${liveCount === 1 ? '' : 's'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PillButton({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 border ${
        selected
          ? 'bg-[#C8A96A] text-white border-[#C8A96A] shadow-saffron'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

function CityRow({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 ${
        selected
          ? 'bg-[#C8A96A]/10 text-[#C8A96A] font-semibold'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span>{label}</span>
      {selected && <Check className="w-4 h-4" />}
    </button>
  )
}
