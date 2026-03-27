import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#111111;border-radius:20px 20px 0 0;padding:40px 48px 32px;text-align:center;">
    <h1 style="margin:0;font-size:32px;font-weight:700;color:#E8760A;font-family:Georgia,serif;">Melaa</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:13px;text-transform:uppercase;letter-spacing:0.1em;">South Asian Wedding Vendors in Canada</p>
  </td></tr>
  <tr><td style="background:#fff;padding:40px 48px;">
    <h2 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#111;font-family:Georgia,serif;">Welcome to Melaa 🌺</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">You are now part of Canada&apos;s most trusted South Asian wedding vendor directory. Here is what you will get every week:</p>
    <div style="background:#FFF8F2;border-radius:12px;border-left:3px solid #E8760A;padding:14px 16px;margin-bottom:12px;">
      <p style="margin:0;font-size:14px;color:#333;font-weight:600;">📸 Weekly Vendor Spotlights</p>
      <p style="margin:4px 0 0;font-size:13px;color:#777;">The best photographers, decorators, caterers and more across the GTA</p>
    </div>
    <div style="background:#F8F8FF;border-radius:12px;border-left:3px solid #6366f1;padding:14px 16px;margin-bottom:12px;">
      <p style="margin:0;font-size:14px;color:#333;font-weight:600;">📋 South Asian Wedding Planning Guides</p>
      <p style="margin:4px 0 0;font-size:13px;color:#777;">Real advice for Desi weddings in Canada — budgets, timelines, vendor tips</p>
    </div>
    <div style="background:#F0FDF4;border-radius:12px;border-left:3px solid #22c55e;padding:14px 16px;margin-bottom:32px;">
      <p style="margin:0;font-size:14px;color:#333;font-weight:600;">🏷️ Subscriber-Only Deals</p>
      <p style="margin:4px 0 0;font-size:13px;color:#777;">Early access to vendor promotions before they go public</p>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://melaa.ca/vendors" style="display:inline-block;background:#E8760A;color:#fff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;text-decoration:none;">Browse 2,700+ Vendors &rarr;</a>
    </div>
    <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">You subscribed at melaa.ca &middot; <a href="https://melaa.ca" style="color:#E8760A;">Visit site</a></p>
  </td></tr>
  <tr><td style="background:#F5F5F0;border-radius:0 0 20px 20px;padding:20px 48px;text-align:center;">
    <p style="margin:0;color:#bbb;font-size:12px;">&copy; 2026 Melaa &middot; <a href="https://melaa.ca" style="color:#E8760A;text-decoration:none;">melaa.ca</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

export async function POST(request: Request) {
  try {
    const { email, name, city, interests } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const supabase = await createClient()

    // 1. Save subscriber to Supabase (graceful if table missing)
    const { error: dbError } = await supabase
      .from('subscribers')
      .upsert(
        {
          email: cleanEmail,
          name: name?.trim() || null,
          city: city?.trim() || null,
          interests: interests || [],
          source: 'website',
          is_active: true,
        },
        { onConflict: 'email' }
      )

    if (dbError && dbError.code !== '42P01') {
      console.error('Subscriber DB error:', dbError.message)
    }

    // 2. Send welcome email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Melaa <hello@melaa.ca>',
      to: [cleanEmail],
      subject: "You're on the Melaa list! 🌺",
      html: WELCOME_HTML,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      // Still success — subscriber is saved even if email delivery fails
    }

    return NextResponse.json({
      success: true,
      message: "You're in! Check your inbox for a welcome email.",
    })
  } catch (err) {
    console.error('Newsletter route error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
