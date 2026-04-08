/**
 * Post-sign-in routing helper.
 *
 * After any auth event (OAuth callback, email/password sign-in, etc), call this to
 * figure out where the user should land. Also handles auto-claiming unclaimed vendor
 * listings when the user's email matches a scraped vendor record.
 *
 * Reuses the existing two-step lookup pattern from /src/app/dashboard/page.tsx
 * (match by claimed_by_user_id, then fallback to email).
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export interface PostSignInResult {
  /** Where to send the user */
  redirectTo: string
  /** Did we auto-claim a vendor listing for this user? */
  autoClaimed: boolean
  /** If auto-claimed, the slug of the vendor */
  claimedVendorSlug?: string
  /** Is this user a vendor (has a claimed record)? */
  isVendor: boolean
}

/**
 * Resolve post-sign-in destination for an authenticated user.
 *
 * Routing rules:
 * 1. If caller passed an explicit `next` path, honor it (but only if it's an
 *    internal path, not an external URL — prevents open-redirect attacks)
 * 2. Else if the user's email matches an UNCLAIMED vendor record → auto-claim it
 *    and send to /dashboard
 * 3. Else if the user's email matches a vendor already claimed by this user → /dashboard
 * 4. Else → /client/dashboard (treat as customer)
 *
 * @param supabase - Server-side Supabase client with the user's session
 * @param userId - auth user UID (from supabase.auth.getUser())
 * @param userEmail - auth user email
 * @param next - optional explicit redirect path from ?next= query param
 */
export async function resolvePostSignInDestination(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  next?: string | null
): Promise<PostSignInResult> {
  // Default result
  const defaultResult: PostSignInResult = {
    redirectTo: '/client/dashboard',
    autoClaimed: false,
    isVendor: false,
  }

  // Honor explicit next param, but only if it's an internal path
  // (prevents open-redirect vulnerabilities)
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    // Still run the vendor lookup so we can auto-claim in the background,
    // but don't override the explicit destination
    try {
      await lookupAndAutoClaim(supabase, userId, userEmail)
    } catch {
      // Silent — we don't want to fail sign-in if the auto-claim query fails
    }
    return { ...defaultResult, redirectTo: next }
  }

  // No explicit next — do smart routing based on vendor match
  try {
    const result = await lookupAndAutoClaim(supabase, userId, userEmail)
    if (result.isVendor) {
      return {
        redirectTo: '/dashboard',
        autoClaimed: result.autoClaimed,
        claimedVendorSlug: result.vendorSlug,
        isVendor: true,
      }
    }
  } catch {
    // Silent — fall through to customer dashboard
  }

  return defaultResult
}

interface LookupResult {
  isVendor: boolean
  autoClaimed: boolean
  vendorSlug?: string
}

/**
 * Look up a vendor record for this user's email and auto-claim it if unclaimed.
 *
 * Uses the same two-step pattern as src/app/dashboard/page.tsx:
 * 1. First try matching by claimed_by_user_id (fast path for repeat logins)
 * 2. Fall back to matching by email (for first-time Google sign-in by a scraped vendor)
 *
 * Auto-claim only happens when claim_status = 'unclaimed' — NEVER overwrites
 * an existing claim (security: prevents account hijack if someone gets access
 * to a claimed vendor's email).
 */
async function lookupAndAutoClaim(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string
): Promise<LookupResult> {
  // Step 1: already-claimed vendor owned by this user
  const byUserId = await supabase
    .from('vendors')
    .select('id, slug, claim_status, claimed_by_user_id')
    .eq('claimed_by_user_id', userId)
    .limit(1)
    .maybeSingle()

  if (byUserId.data) {
    return { isVendor: true, autoClaimed: false, vendorSlug: byUserId.data.slug }
  }

  // Step 2: email match (case-insensitive)
  const byEmail = await supabase
    .from('vendors')
    .select('id, slug, claim_status, claimed_by_user_id')
    .ilike('email', userEmail)
    .limit(1)
    .maybeSingle()

  if (!byEmail.data) {
    return { isVendor: false, autoClaimed: false }
  }

  const vendor = byEmail.data

  // Already claimed by someone else — user with matching email is NOT this vendor's owner
  // This is unusual but handle it gracefully by not treating them as a vendor
  if (vendor.claimed_by_user_id && vendor.claimed_by_user_id !== userId) {
    return { isVendor: false, autoClaimed: false }
  }

  // Unclaimed — auto-claim it
  if (vendor.claim_status === 'unclaimed' || !vendor.claimed_by_user_id) {
    void userEmail // reserved for when claim_email column is migrated
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        claimed_by_user_id: userId,
        claim_status: 'claimed',
      })
      .eq('id', vendor.id)
      .eq('claim_status', 'unclaimed') // race-condition guard

    if (updateError) {
      // Update failed — another process claimed it first, or RLS blocked it
      return { isVendor: false, autoClaimed: false }
    }

    return { isVendor: true, autoClaimed: true, vendorSlug: vendor.slug }
  }

  // Fall through — vendor was claimed by this user via email match but something odd happened
  return { isVendor: true, autoClaimed: false, vendorSlug: vendor.slug }
}
