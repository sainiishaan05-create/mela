'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: { id: string; slug: string; name: string; icon: string }[]
  cities: { id: string; slug: string; name: string }[]
  activeCategory?: string
  activeCity?: string
  activeSort?: string
  search?: string
}

export default function FilterDrawer({
  isOpen,
  onClose,
  categories,
  cities,
  activeCategory,
  activeCity,
  activeSort,
  search,
}: FilterDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState(activeCategory ?? '')
  const [selectedCity, setSelectedCity] = useState(activeCity ?? '')
  const [selectedSort, setSelectedSort] = useState(activeSort ?? '')
  const [citySearch, setCitySearch] = useState('')

  // Sync with props when drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(activeCategory ?? '')
      setSelectedCity(activeCity ?? '')
      setSelectedSort(activeSort ?? '')
      setCitySearch('')
    }
  }, [isOpen, activeCategory, activeCity, activeSort])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const filteredCities = citySearch
    ? cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities

  function handleApply() {
    const params = new URLSearchParams({
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedCity ? { city: selectedCity } : {}),
      ...(search ? { search } : {}),
      ...(selectedSort ? { sort: selectedSort } : {}),
    })
    const qs = params.toString()
    // Restore body scroll immediately since we're navigating away
    document.body.style.overflow = ''
    window.location.href = `/vendors${qs ? `?${qs}` : ''}`
  }

  function handleClearAll() {
    // Restore body scroll + navigate to unfiltered vendors page
    document.body.style.overflow = ''
    window.location.href = '/vendors'
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — uses svh so Safari URL bar doesn't eat the header */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          maxHeight: '88svh',
          height: '88svh',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Filter vendors"
      >
        {/* ── STICKY TOP: Drag handle + title + Show Results CTA ── */}
        <div className="shrink-0 bg-white rounded-t-3xl border-b border-gray-100">
          <div className="pt-2.5 pb-1 flex justify-center">
            <div className="w-12 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center justify-between px-5 pt-2 pb-3">
            <h2 className="text-base font-bold text-[#111111]">Filter vendors</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          {/* Primary Show Results button — sitting at the top so users always see it */}
          <div className="px-5 pb-4 flex gap-3">
            <button
              type="button"
              onClick={handleClearAll}
              className="shrink-0 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 bg-[#C8A96A] text-white font-bold py-3.5 rounded-2xl shadow-saffron text-sm transition-opacity hover:opacity-90 active:opacity-80 flex items-center justify-center gap-2"
            >
              Show results
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Category section */}
          <div className="mb-6">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-3">
              Category
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  !selectedCategory
                    ? 'bg-[#C8A96A] text-white shadow-saffron border-[#C8A96A]'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 border text-left ${
                    selectedCategory === cat.slug
                      ? 'bg-[#C8A96A] text-white shadow-saffron border-[#C8A96A]'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-6" />

          {/* City section */}
          <div className="mb-6">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-3">
              City
            </h3>
            <input
              type="text"
              placeholder="Search cities..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C8A96A]/20 focus:border-[#C8A96A] outline-none mb-3"
            />
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              <button
                type="button"
                onClick={() => setSelectedCity('')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  !selectedCity
                    ? 'bg-[#C8A96A]/10 text-[#C8A96A] font-semibold'
                    : 'text-gray-600'
                }`}
              >
                All Cities
              </button>
              {filteredCities.map(c => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedCity(c.slug)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    selectedCity === c.slug
                      ? 'bg-[#C8A96A]/10 text-[#C8A96A] font-semibold'
                      : 'text-gray-600'
                  }`}
                >
                  {c.name}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-sm text-gray-400 px-3 py-2">No cities found</p>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-6" />

          {/* Sort section */}
          <div className="mb-4">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-3">
              Sort By
            </h3>
            <div className="flex gap-2">
              {[
                { value: '', label: 'Recommended' },
                { value: 'newest', label: 'Newest First' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedSort(opt.value)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                    selectedSort === opt.value || (!selectedSort && !opt.value)
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
