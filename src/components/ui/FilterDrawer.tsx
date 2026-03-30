'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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
    window.location.href = `/vendors${qs ? `?${qs}` : ''}`
  }

  function handleClearAll() {
    setSelectedCategory('')
    setSelectedCity('')
    setSelectedSort('')
    setCitySearch('')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter vendors"
      >
        {/* Drag handle */}
        <div className="pt-4 pb-2 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#111111]">Filters</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Category section */}
          <div className="mb-6">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-3">
              Category
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  !selectedCategory
                    ? 'bg-[#C8A96A] text-white shadow-saffron border-[#C8A96A]'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#C8A96A]/40'
                }`}
              >
                <span className="text-base leading-none">✨</span>
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border ${
                    selectedCategory === cat.slug
                      ? 'bg-[#C8A96A] text-white shadow-saffron border-[#C8A96A]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-[#C8A96A]/40'
                  }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-6" />

          {/* City section */}
          <div className="mb-6">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-3">
              City
            </h3>
            {/* City search */}
            <input
              type="text"
              placeholder="Search cities..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C8A96A]/20 focus:border-[#C8A96A] outline-none mb-3"
            />
            {/* City list */}
            <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
              <button
                onClick={() => setSelectedCity('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                  !selectedCity
                    ? 'bg-[#C8A96A]/10 text-[#C8A96A] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                All Cities
              </button>
              {filteredCities.map(c => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCity(c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                    selectedCity === c.slug
                      ? 'bg-[#C8A96A]/10 text-[#C8A96A] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-6" />

          {/* Sort section */}
          <div className="mb-8">
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
                  onClick={() => setSelectedSort(opt.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border ${
                    selectedSort === opt.value || (!selectedSort && !opt.value)
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={handleApply}
            className="w-full bg-[#C8A96A] text-white font-bold py-4 rounded-2xl shadow-saffron text-base transition-opacity hover:opacity-90 active:opacity-80"
          >
            Show Results →
          </button>
        </div>
      </div>
    </>
  )
}
