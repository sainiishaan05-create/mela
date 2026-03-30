'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import FilterDrawer from '@/components/ui/FilterDrawer'

interface MobileFilterButtonProps {
  categories: { id: string; slug: string; name: string; icon: string }[]
  cities: { id: string; slug: string; name: string }[]
  activeCategory?: string
  activeCity?: string
  activeSort?: string
  search?: string
}

export default function MobileFilterButton({
  categories,
  cities,
  activeCategory,
  activeCity,
  activeSort,
  search,
}: MobileFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = [
    activeCategory ? 1 : 0,
    activeCity ? 1 : 0,
    activeSort ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:border-[#C8A96A]/40 hover:text-[#C8A96A] transition-all duration-150"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#C8A96A] text-white text-xs font-bold leading-none">
            {activeFilterCount}
          </span>
        )}
      </button>

      <FilterDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={categories}
        cities={cities}
        activeCategory={activeCategory}
        activeCity={activeCity}
        activeSort={activeSort}
        search={search}
      />
    </>
  )
}
