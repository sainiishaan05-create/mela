import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import DashboardShell from './DashboardShell'

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const metadata: Metadata = { title: 'Vendor Dashboard | Melaa' }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ claimed?: string; upgraded?: string }>
}) {
  const params = await searchParams
  const justClaimed = params.claimed === '1'
  const justUpgraded = params.upgraded === '1'

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
    // User is signed in but owns no vendor listing — they're a customer,
    // not a vendor. Send them to their customer dashboard instead of the
    // "no listing found" screen (which is vendor-oriented).
    redirect('/client/dashboard')
  }

  // Fetch leads, categories and cities via service client
  const [{ data: leads }, { data: categories }, { data: cities }] = await Promise.all([
    service.from('leads').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false }).limit(500),
    service.from('categories').select('id,slug,name,icon,description,created_at').eq('is_active', true).order('name'),
    service.from('cities').select('*').eq('is_active', true).order('name'),
  ])

  return (
    <DashboardShell
      vendor={vendor}
      leads={leads ?? []}
      categories={categories ?? []}
      cities={cities ?? []}
      justClaimed={justClaimed}
      justUpgraded={justUpgraded}
      userId={user.id}
    />
  )
}
