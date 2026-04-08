import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import VendorOnboardingForm from './VendorOnboardingForm'
import type { Category, City } from '@/types'

export const metadata: Metadata = {
  title: 'Complete your vendor profile | Melaa',
}

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Vendor onboarding page — shown AFTER a vendor signs in with Google (or email)
 * but hasn't created a vendor record yet. Fast path: 3 fields and you're live.
 *
 * Routing guardrails:
 * - Not signed in → /login?next=/onboarding/vendor
 * - Already owns a vendor → /dashboard (no duplicate listings)
 */
export default async function VendorOnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/onboarding/vendor')
  }

  const svc = admin()

  // Already own a vendor?
  const { data: existing } = await svc
    .from('vendors')
    .select('slug')
    .eq('claimed_by_user_id', user.id)
    .maybeSingle()

  if (existing) {
    redirect('/dashboard')
  }

  // Load categories + cities for the form
  const [{ data: categories }, { data: cities }] = await Promise.all([
    svc.from('categories').select('*').order('name'),
    svc.from('cities').select('*').order('name'),
  ])

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C8A96A]">
            Step 2 of 2
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A] mt-2">
            Complete your listing
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Signed in as <span className="font-semibold text-[#1A1A1A]">{user.email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(26,26,26,0.08)]">
          <VendorOnboardingForm
            categories={(categories ?? []) as Category[]}
            cities={(cities ?? []) as City[]}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Not a vendor?{' '}
          <a href="/client/dashboard" className="text-[#C8A96A] font-medium hover:underline">
            Go to your dashboard
          </a>
        </p>
      </div>
    </div>
  )
}
