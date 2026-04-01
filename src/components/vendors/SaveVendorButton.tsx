'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  vendorId: string
  vendorName: string
  className?: string
}

export default function SaveVendorButton({ vendorId, vendorName, className = '' }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setAuthed(true)

      const res = await fetch('/api/client/saved-vendors')
      if (res.ok) {
        const { saved: list } = await res.json()
        setSaved(list.some((s: { vendor_id: string }) => s.vendor_id === vendorId))
      }
      setLoading(false)
    }
    init()
  }, [vendorId])

  async function toggle() {
    if (!authed) {
      window.location.href = `/login?next=/vendors/${vendorId}`
      return
    }
    setAnimating(true)
    const next = !saved
    setSaved(next)

    await fetch('/api/client/saved-vendors', {
      method: next ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId }),
    })
    setTimeout(() => setAnimating(false), 400)
  }

  if (loading) return null

  return (
    <button
      onClick={toggle}
      title={saved ? `Remove ${vendorName} from saved` : `Save ${vendorName}`}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border font-medium text-sm transition-all duration-200 ${
        saved
          ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
          : 'bg-white border-gray-200 text-gray-500 hover:border-[#C8A96A] hover:text-[#C8A96A]'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-200 ${animating ? 'scale-125' : 'scale-100'}`}
        fill={saved ? 'currentColor' : 'none'}
      />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
