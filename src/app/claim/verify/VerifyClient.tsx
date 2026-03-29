'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle } from 'lucide-react'

export default function VerifyClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('This link has expired or is invalid.')
  const [vendorSlug, setVendorSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token found.')
      return
    }

    // The verify API does a redirect itself (to Stripe checkout or error page)
    // We call it via fetch to handle non-redirect error responses, then follow location manually
    async function runVerify() {
      try {
        const res = await fetch(`/api/claim/verify?token=${encodeURIComponent(token!)}`, {
          redirect: 'manual',
        })

        if (res.type === 'opaqueredirect' || res.status === 0) {
          // fetch swallowed the redirect — trigger a full navigation instead
          window.location.href = `/api/claim/verify?token=${encodeURIComponent(token!)}`
          return
        }

        if (res.redirected) {
          window.location.href = res.url
          return
        }

        // Non-redirect response means an error
        setStatus('error')
        setErrorMsg('This link has expired or is invalid.')
      } catch {
        setStatus('error')
        setErrorMsg('Something went wrong. Please try again.')
      }
    }

    runVerify()
  }, [token])

  // Extract vendor slug from error searchParam if present
  useEffect(() => {
    const slug = searchParams.get('slug')
    if (slug) setVendorSlug(slug)
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E8760A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-[#E8760A] animate-spin" />
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1A1A1A] mb-2">
          Verifying your email…
        </h2>
        <p className="text-gray-500 text-sm">Redirecting to checkout, please wait.</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1A1A1A] mb-2">
        Verification failed
      </h2>
      <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
      {vendorSlug ? (
        <Link
          href={`/claim/${vendorSlug}`}
          className="inline-flex items-center gap-2 bg-[#E8760A] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-[#d16a09] transition"
        >
          Try again
        </Link>
      ) : (
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#E8760A] hover:underline text-sm font-medium"
        >
          Go back to Melaa
        </Link>
      )}
    </div>
  )
}
