'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, X, MapPin, Loader2, Camera, UtensilsCrossed, Leaf, Palette, Music, Flower2, type LucideIcon } from 'lucide-react'

const SUGGESTIONS: { label: string; Icon: LucideIcon }[] = [
  { label: 'Photographers in Brampton',   Icon: Camera },
  { label: 'Caterers Mississauga',         Icon: UtensilsCrossed },
  { label: 'Mehndi Artists Toronto',       Icon: Leaf },
  { label: 'Bridal Makeup & Hair GTA',     Icon: Palette },
  { label: 'South Asian DJ',               Icon: Music },
  { label: 'Wedding Decorators Vaughan',   Icon: Flower2 },
]

export default function SearchBar({ dark = false }: { dark?: boolean }) {
  const [query,   setQuery]   = useState('')
  const [focused, setFocused] = useState(false)
  const [locating, setLocating] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const router     = useRouter()

  function handleNearMe() {
    if (!navigator.geolocation) {
      alert('Location is not supported by your browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        router.push(`/vendors?lat=${pos.coords.latitude.toFixed(4)}&lng=${pos.coords.longitude.toFixed(4)}&radius=25`)
      },
      () => {
        setLocating(false)
        alert('Unable to get your location. Please allow location access and try again.')
      },
      { timeout: 10000 }
    )
  }

  // Close on outside click
  const onDoc = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setFocused(false)
    }
  }, [])
  useEffect(() => {
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [onDoc])

  function submit(value?: string) {
    const trimmed = (value ?? query).trim()
    if (trimmed) {
      setFocused(false)
      router.push(`/vendors?search=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/vendors')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit()
  }

  const showDropdown = focused && !query

  if (dark) {
    return (
      <div ref={wrapperRef} className="relative w-full max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="search-dark-form"
          style={{
            boxShadow: focused
              ? '0 0 0 1px rgba(200,169,106,0.45), 0 12px 32px rgba(0,0,0,0.35)'
              : '0 0 0 1px rgba(200,169,106,0.18), 0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <Search
            className="shrink-0 ml-4"
            style={{
              width: 18, height: 18,
              color: focused ? '#C8A96A' : 'rgba(200,169,106,0.5)',
              transition: 'color 0.2s',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search photographers, caterers, mehndi..."
            className="search-dark-input"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="shrink-0 mr-1 p-1.5 rounded-lg transition-colors hover:bg-white/10"
              aria-label="Clear"
            >
              <X style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.4)' }} />
            </button>
          )}
          <button
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            className="shrink-0 mr-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              color: '#C8A96A',
              background: 'rgba(200,169,106,0.1)',
              border: '1px solid rgba(200,169,106,0.2)',
            }}
          >
            {locating ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <MapPin style={{ width: 14, height: 14 }} />}
            Near Me
          </button>
          <button type="submit" className="search-dark-btn">
            Search
            <ArrowRight style={{ width: 15, height: 15 }} />
          </button>
        </form>
      </div>
    )
  }

  // Light mode (for vendors page, etc.)
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
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search photographers, caterers, mehndi..."
          className="flex-1 px-4 py-4 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-sm md:text-base"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="mr-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleNearMe}
          disabled={locating}
          className="m-1 mr-0 flex items-center gap-1.5 border border-[#C8A96A]/30 text-[#C8A96A] hover:bg-[#C8A96A]/10 font-semibold px-3 py-3 rounded-xl text-sm transition-colors duration-200 whitespace-nowrap"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          Near Me
        </button>
        <button
          type="submit"
          className="m-2 ml-1 flex items-center gap-2 bg-[#C8A96A] hover:bg-[#B8945A] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors duration-200 whitespace-nowrap"
        >
          Search
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Popular Searches</p>
          </div>
          {SUGGESTIONS.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => submit(label)}
              className="group w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5ECD7]/60 transition-colors duration-150 text-left"
            >
              <Icon className="w-4 h-4 text-[#C8A96A]" />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
              <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#C8A96A] ml-auto opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
