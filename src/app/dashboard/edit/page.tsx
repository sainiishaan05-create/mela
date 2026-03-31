import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditVendorForm from '@/components/dashboard/EditVendorForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Listing | Melaa' }

export default async function EditListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: vendor }, { data: categories }, { data: cities }] = await Promise.all([
    admin.from('vendors').select('*, category:categories(*), city:cities(*)').eq('claimed_by_user_id', user.id).single(),
    admin.from('categories').select('*').order('name'),
    admin.from('cities').select('*').order('name'),
  ])

  if (!vendor) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#C8A96A] transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">Edit Your Listing</h1>
          <p className="text-gray-500 text-sm mt-1">Changes go live immediately on your public profile.</p>
        </div>

        {/* Current listing preview link */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">{vendor.name}</p>
            <p className="text-xs text-gray-400">melaa.ca/vendors/{vendor.slug}</p>
          </div>
          <Link href={`/vendors/${vendor.slug}`} target="_blank"
            className="text-xs font-semibold text-[#C8A96A] hover:underline">
            View live →
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <EditVendorForm vendor={vendor} categories={categories ?? []} cities={cities ?? []} />
        </div>
      </div>
    </div>
  )
}
