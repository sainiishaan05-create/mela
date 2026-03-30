'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

interface CitySearchProps {
  cities: { id: string; slug: string; name: string }[]
  activeCity?: string
  activeCategory?: string
}

export default function CitySearch({ cities, activeCity, activeCategory }: CitySearchProps) {
  const [citySearch, setCitySearch] = useState('')

  const filteredCities = citySearch
    ? cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities

  return (
    <div>
      {/* Search input */}
      <input
        type="text"
        placeholder="Search cities..."
        value={citySearch}
        onChange={e => setCitySearch(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C8A96A]/20 focus:border-[#C8A96A] outline-none mb-2"
      />

      {/* City list */}
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
        <Link
          href={activeCategory ? `/vendors?category=${activeCategory}` : '/vendors'}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
            !activeCity
              ? 'bg-[#C8A96A]/10 text-[#C8A96A] font-semibold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 opacity-60" />
          All Cities
        </Link>
        {filteredCities.map(c => (
          <Link
            key={c.slug}
            href={`/vendors?city=${c.slug}${activeCategory ? `&category=${activeCategory}` : ''}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
              activeCity === c.slug
                ? 'bg-[#C8A96A]/10 text-[#C8A96A] font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="w-1 h-1 rounded-full bg-current opacity-40 shrink-0" />
            {c.name}
          </Link>
        ))}
        {filteredCities.length === 0 && (
          <p className="text-sm text-gray-400 px-3 py-2">No cities found</p>
        )}
      </div>
    </div>
  )
}
