import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePostSignInDestination } from '@/lib/auth/post-signin'

/**
 * OAuth callback handler — used by Google sign-in (and any future provider).
 *
 * Flow:
 * 1. Exchange the OAuth code for a Supabase session
 * 2. Look up the authenticated user
 * 3. Use resolvePostSignInDestination() to figure out where to send them:
 *    - If their email matches an UNCLAIMED vendor → auto-claim and redirect to /dashboard
 *    - If they own a vendor → /dashboard
 *    - Otherwise → /client/dashboard
 * 4. Honor an explicit ?next=... query param if present (for "claim this listing" flows)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchange error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  // Get the authenticated user (their email is what we use to look up vendor records)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('[auth/callback] no user after exchange:', userError?.message)
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  // Smart routing + auto-claim
  let destination = '/client/dashboard'
  try {
    const result = await resolvePostSignInDestination(supabase, user.id, user.email ?? '', next)
    destination = result.redirectTo

    if (result.autoClaimed && result.claimedVendorSlug) {
      console.log(`[auth/callback] auto-claimed vendor "${result.claimedVendorSlug}" for user ${user.id}`)
    }
  } catch (err) {
    console.error('[auth/callback] routing error:', err)
    // Safe fallback
    destination = '/client/dashboard'
  }

  return NextResponse.redirect(`${origin}${destination}`)
}
