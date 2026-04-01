import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DashboardShell from './DashboardShell'

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

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

  const service = getServiceClient()

  // 1. Primary lookup — claimed_by_user_id
  let { data: vendor } = await service
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .eq('claimed_by_user_id', user.id)
    .limit(1)
    .maybeSingle()

  // 2. Fallback — match by email and auto-link (handles bulk-imported vendors
  //    and accounts created before claimed_by_user_id was tracked)
  if (!vendor && user.email) {
    const { data: emailMatch } = await service
      .from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('email', user.email)
      .is('claimed_by_user_id', null)
      .limit(1)
      .maybeSingle()

    if (emailMatch) {
      await service
        .from('vendors')
        .update({ claimed_by_user_id: user.id, claim_status: 'claimed' })
        .eq('id', emailMatch.id)
      vendor = { ...emailMatch, claimed_by_user_id: user.id }
    }
  }

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

  // Fetch leads, categories and cities via service client
  const [{ data: leads }, { data: categories }, { data: cities }] = await Promise.all([
    service.from('leads').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false }).limit(500),
    service.from('categories').select('id,slug,name,icon,description,created_at').eq('is_active', true).order('name'),
    service.from('cities').select('id,slug,name,province,created_at').eq('is_active', true).order('name'),
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
