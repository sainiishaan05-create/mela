import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import VerifyClient from './VerifyClient'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Verify Email | Melaa',
}

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ClaimVerifyPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
        <div className="text-center mb-6">
          <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#C8A96A]">
            Melaa
          </span>
        </div>
        <Suspense
          fallback={
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#C8A96A] animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Verifying…</p>
            </div>
          }
        >
          <VerifyClient />
        </Suspense>
      </div>
    </div>
  )
}
