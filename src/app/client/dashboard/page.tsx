import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ClientDashboardShell from './ClientDashboardShell'
import type { SavedVendor, Review } from '@/types'

export const metadata: Metadata = { title: 'My Dashboard | Melaa' }

function service() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/client/dashboard')

  const admin = service()

  const [{ data: savedRaw }, { data: reviewsRaw }, { data: ownedVendor }] = await Promise.all([
    admin
      .from('saved_vendors')
      .select('*, vendor:vendors(*, category:categories(*), city:cities(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    admin
      .from('reviews')
      .select('*, vendor:vendors(id, name, slug, category:categories(name, icon))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    // Check if user owns a vendor (so we can show "Switch to vendor view")
    admin
      .from('vendors')
      .select('id, slug')
      .eq('claimed_by_user_id', user.id)
      .maybeSingle(),
  ])

  return (
    <ClientDashboardShell
      userEmail={user.email ?? ''}
      initialSaved={(savedRaw ?? []) as SavedVendor[]}
      initialReviews={(reviewsRaw ?? []) as Review[]}
      hasVendorListing={!!ownedVendor}
    />
  )
}
