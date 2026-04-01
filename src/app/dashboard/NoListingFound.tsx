'use client'

import Link from 'next/link'
import { Search, ArrowUpRight } from 'lucide-react'
import LogoutButton from '@/components/ui/LogoutButton'

interface Props {
  userEmail: string
}

export default function NoListingFound({ userEmail }: Props) {

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#C8A96A]/10 flex items-center justify-center text-4xl mx-auto mb-6">
          🏪
        </div>

        {/* Heading */}
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#2B2623] mb-2">
          No listing found
        </h1>
        <p className="text-gray-500 text-sm mb-1">
          Signed in as <span className="font-medium text-[#2B2623]">{userEmail}</span>
        </p>
        <p className="text-gray-400 text-sm mb-8">
          We couldn&apos;t find a claimed business listing linked to your account.
          Find your business in the directory and claim it to get started.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/vendors"
            className="flex items-center justify-center gap-2 w-full bg-[#C8A96A] hover:bg-[#B8945A] text-white font-semibold px-6 py-3.5 rounded-full transition-colors"
          >
            <Search className="w-4 h-4" />
            Find My Business
          </Link>

          <Link
            href="/list-your-business"
            className="flex items-center justify-center gap-2 w-full border border-[#C8A96A] text-[#C8A96A] hover:bg-[#F5ECD7] font-semibold px-6 py-3.5 rounded-full transition-colors"
          >
            List My Business Free
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <div className="flex justify-center">
            <LogoutButton
              label="Sign out"
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-medium px-6 py-3 rounded-full transition-colors text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
