'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut, ArrowRight } from 'lucide-react'

interface Props {
  /** Where to send the user if they choose to continue with the current session */
  continueHref?: string
  /** Optional label override for the primary button */
  continueLabel?: string
}

/**
 * If the visitor already has a Supabase session, show a friendly banner:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ Signed in as user@example.com            │
 *   │ [Continue] [Use a different account]    │
 *   └──────────────────────────────────────────┘
 *
 * This prevents the classic "wrong account" frustration — you can bail out
 * with one click instead of manually signing out somewhere else first.
 */
export default function AuthSessionBanner({
  continueHref = '/dashboard',
  continueLabel = 'Continue',
}: Props) {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
      setLoading(false)
    })
  }, [])

  async function handleSwitchAccount() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // Stay on this page — the banner will disappear and the form becomes active
    setEmail(null)
    setSigningOut(false)
  }

  if (loading || !email) return null

  return (
    <div className="mb-6 p-4 rounded-2xl border border-[#C8A96A]/25 bg-[#FFFDF7]">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
        Already signed in
      </p>
      <p className="text-sm text-gray-700 mb-3">
        as <span className="font-semibold text-[#1A1A1A]">{email}</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={continueHref}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C8A96A] text-white text-sm font-semibold hover:bg-[#B8945A] transition-colors"
        >
          {continueLabel}
          <ArrowRight className="w-4 h-4" />
        </a>
        <button
          type="button"
          onClick={handleSwitchAccount}
          disabled={signingOut}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors disabled:opacity-60"
        >
          <LogOut className="w-3.5 h-3.5" />
          {signingOut ? 'Signing out…' : 'Use a different account'}
        </button>
      </div>
    </div>
  )
}
