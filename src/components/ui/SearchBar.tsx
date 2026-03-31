'use client'

import { useState, useRef, useEffect } from 'react'
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

export default function SearchBar({ dark = false }: { dark?: boolean }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Recalculate fixed dropdown position whenever focused or window resizes
  useEffect(() => {
    function recalc() {
      if (!wrapperRef.current) return
      const rect = wrapperRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
    if (focused) recalc()
    window.addEventListener('resize', recalc)
    window.addEventListener('scroll', recalc, { passive: true })
    return () => {
      window.removeEventListener('resize', recalc)
      window.removeEventListener('scroll', recalc)
    }
  }, [focused])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) router.push(`/vendors?search=${encodeURIComponent(trimmed)}`)
  }

  function handleSuggestion(suggestion: string) {
    router.push(`/vendors?search=${encodeURIComponent(suggestion)}`)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
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
          className="m-2 flex items-center gap-2 bg-[#C8A96A] hover:bg-[#B8945A] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors duration-200 whitespace-nowrap"
        >
          Search
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Fixed-position dropdown — escapes ALL stacking contexts */}
      {focused && !query && (
        <div
          style={dropdownStyle}
          className="bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-gray-100 overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Popular Searches</p>
          </div>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestion(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5ECD7]/60 transition-colors duration-150 text-left group"
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
