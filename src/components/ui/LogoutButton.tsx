'use client'

import { useState } from 'react'
import { LogOut, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  /** Extra Tailwind classes for the trigger button */
  className?: string
  /** Text shown on the trigger button */
  label?: string
}

export default function LogoutButton({ className = '', label = 'Sign out' }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function doLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 font-medium">Log out?</span>
        <button
          onClick={doLogout}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
        >
          <Check className="w-3 h-3" />
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 text-xs font-semibold transition-colors"
        >
          <X className="w-3 h-3" />
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={className}
    >
      <LogOut className="w-4 h-4" />
      {label}
    </button>
  )
}
