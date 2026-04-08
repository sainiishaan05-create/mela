'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SlidersHorizontal, Search as SearchIcon, X } from 'lucide-react'
import FilterSheet from './FilterSheet'
import type { Category, City } from '@/types'

interface FilterBarProps {
  categories: Category[]
  cities: City[]
  featuredCategorySlugs: string[]
  activeCategory?: string
  activeCity?: string
  activeSort?: string
  activeBadge?: string
  search?: string
  totalVendors: number
}

export default function FilterBar({
  categories,
  cities,
  featuredCategorySlugs,
  activeCategory,
  activeCity,
  activeSort,
  activeBadge,
  search,
  totalVendors,
}: FilterBarProps) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(search ?? '')

  // Keep search input in sync with URL
  useEffect(() => { setSearchValue(search ?? '') }, [search])

  const activeCount =
    (activeCategory ? 1 : 0) +
    (activeCity ? 1 : 0) +
    (activeSort ? 1 : 0) +
    (activeBadge ? 1 : 0)

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (activeCity) params.set('city', activeCity)
    if (activeSort) params.set('sort', activeSort)
    if (activeBadge) params.set('badge', activeBadge)
    if (searchValue.trim()) params.set('search', searchValue.trim())
    const qs = params.toString()
    router.push(`/vendors${qs ? `?${qs}` : ''}`)
    setSearchOpen(false)
  }, [searchValue, activeCategory, activeCity, activeSort, activeBadge, router])

  const featuredCategories = featuredCategorySlugs
    .map(slug => categories.find(c => c.slug === slug))
    .filter((c): c is Category => !!c)

  function buildCategoryHref(slug: string | null) {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (activeCity) params.set('city', activeCity)
    if (activeSort) params.set('sort', activeSort)
    if (activeBadge) params.set('badge', activeBadge)
    if (search) params.set('search', search)
    const qs = params.toString()
    return `/vendors${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <div className="sticky top-16 z-30 border-b" style={{
        background: 'rgba(250,250,247,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(200,169,106,0.15)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── MOBILE BAR (<lg) ── */}
          <div className="lg:hidden flex items-center gap-2 h-14">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Search vendors..."
                  className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchValue(search ?? '') }}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/60 border border-gray-200/80 text-gray-600 hover:border-[#C8A96A]/40 hover:text-[#C8A96A] transition-colors"
                  aria-label="Search vendors"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="flex items-center gap-2 px-4 h-11 rounded-full bg-white border border-gray-200/80 text-sm font-semibold text-gray-800 hover:border-[#C8A96A]/40 hover:text-[#C8A96A] transition-colors shadow-sm"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C8A96A] text-white text-[11px] font-bold leading-none">
                      {activeCount}
                    </span>
                  )}
                </button>
                <span className="ml-auto text-xs text-gray-500 font-medium tabular-nums">
                  {totalVendors.toLocaleString()} vendors
                </span>
              </>
            )}
          </div>

          {/* ── DESKTOP BAR (≥lg) ── */}
          <div className="hidden lg:flex items-center gap-3 h-16">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 h-10 w-64 focus-within:border-[#C8A96A] focus-within:shadow-[0_0_0_3px_rgba(200,169,106,0.12)] transition-all">
              <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search vendors..."
                className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-800 min-w-0"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => { setSearchValue(''); handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent) }}
                  aria-label="Clear search"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Category pill strip */}
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <Link
                href={buildCategoryHref(null)}
                className={`shrink-0 px-3.5 h-9 rounded-full text-xs font-semibold flex items-center transition-all duration-200 ${
                  !activeCategory
                    ? 'bg-[#111111] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                All
              </Link>
              {featuredCategories.map(cat => (
                <Link
                  key={cat.slug}
                  href={buildCategoryHref(cat.slug)}
                  className={`shrink-0 px-3.5 h-9 rounded-full text-xs font-semibold flex items-center transition-all duration-200 ${
                    activeCategory === cat.slug
                      ? 'bg-[#C8A96A] text-white shadow-saffron'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C8A96A]/40 hover:text-[#C8A96A]'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* More filters */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="shrink-0 flex items-center gap-2 px-4 h-10 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#C8A96A]/50 hover:text-[#C8A96A] transition-colors"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              More
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C8A96A] text-white text-[11px] font-bold leading-none">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <FilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        categories={categories}
        cities={cities}
        activeCategory={activeCategory}
        activeCity={activeCity}
        activeSort={activeSort}
        activeBadge={activeBadge}
        search={search}
      />
    </>
  )
}
