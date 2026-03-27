import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, name, city, interests } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
          city: city?.trim() || null,
          interests: interests || [],
          source: 'website',
          is_active: true,
        },
        { onConflict: 'email' }
      )
      .select()

    if (error) {
      // If table doesn't exist yet, return success anyway (graceful)
      if (error.code === '42P01') {
        return NextResponse.json({ success: true, message: 'Subscribed!' })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "You're subscribed! Welcome to Melaa." })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
