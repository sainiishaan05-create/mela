import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DashboardShell from './DashboardShell'

export const metadata: Metadata = { title: 'Vendor Dashboard | Mela' }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ claimed?: string }>
}) {
  const params = await searchParams
  const justClaimed = params.claimed === '1'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('claimed_by_user_id', user.id)
    .limit(1)
    .single()

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">
          No claimed listing found
        </h1>
        <p className="text-gray-500 mb-6">
          Find your business in our directory and claim your listing to get started.
        </p>
        <Link
          href="/vendors"
          className="bg-[#C8A96A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#B8945A] transition-colors"
        >
          Find Your Listing
        </Link>
      </div>
    )
  }

  // Fetch leads (most recent 500 — enough for full history without memory issues)
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .limit(500)

  // Fetch categories and cities for the Edit Profile dropdowns
  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('id,slug,name,icon,description,created_at').eq('is_active', true).order('name'),
    supabase.from('cities').select('id,slug,name,province,created_at').eq('is_active', true).order('name'),
  ])

  return (
    <DashboardShell
      vendor={vendor}
      leads={leads ?? []}
      categories={categories ?? []}
      cities={cities ?? []}
      justClaimed={justClaimed}
      userId={user.id}
    />
  )
}
