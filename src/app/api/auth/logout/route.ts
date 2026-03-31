import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Sign-out errors are non-fatal; proceed with redirect.
  }
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}

export async function GET() { return signOut() }
export async function POST() { return signOut() }
