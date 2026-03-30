'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'

const SUGGESTIONS = [
  'Photographers in Brampton',
  'Caterers Mississauga',
  'Mehndi Artists Toronto',
  'Bridal Makeup GTA',
  'South Asian DJ',
  'Wedding Decorators',
]

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/vendors?search=${encodeURIComponent(trimmed)}`)
    }
  }

  function handleSuggestion(suggestion: string) {
    router.push(`/vendors?search=${encodeURIComponent(suggestion)}`)
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`w-full flex items-center bg-white rounded-2xl transition-all duration-300 ${
          focused
            ? 'shadow-[0_0_0_3px_rgba(200,169,106,0.2),0_8px_32px_rgba(0,0,0,0.12)]'
            : 'shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="flex items-center pl-5 text-gray-400">
          <Search className={`w-5 h-5 transition-colors duration-200 ${focused ? 'text-[#C8A96A]' : 'text-gray-400'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search photographers, caterers, mehndi..."
          className="flex-1 px-4 py-4 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-sm md:text-base"
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Search"
          className="btn-primary m-2 flex items-center gap-2 bg-[#C8A96A] hover:bg-[#B8945A] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors duration-200 shadow-saffron whitespace-nowrap"
        >
          Search
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Suggestion dropdown */}
      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-slide-down">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Popular Searches</p>
          </div>
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestion(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5ECD7]/60 transition-colors duration-150 text-left group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <Search className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C8A96A] transition-colors shrink-0" />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{suggestion}</span>
              <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#C8A96A] ml-auto opacity-0 group-hover:opacity-100 transition-all duration-150" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
