'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/vendors?search=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex items-center bg-white rounded-full shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-[#E8760A] focus-within:ring-offset-2"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search photographers, decorators, caterers..."
        className="flex-1 px-5 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent outline-none text-sm md:text-base"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex items-center justify-center bg-[#E8760A] hover:bg-[#d06a09] transition-colors text-white px-5 py-3.5"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  )
}
