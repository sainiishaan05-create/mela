import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { slug, email } = body as { slug?: string; email?: string }

    if (!slug || !email) {
      return NextResponse.json({ error: 'Missing slug or email' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Look up vendor by slug
    const { data: vendor, error: lookupError } = await supabase
      .from('vendors')
      .select('id, name, slug, claim_status')
      .eq('slug', slug)
      .single()

    if (lookupError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 400 })
    }

    if (vendor.claim_status === 'claimed') {
      return NextResponse.json({ error: 'This listing has already been claimed' }, { status: 400 })
    }

    // Generate 32-byte hex token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Store token + expiry, set claim_status = 'pending'.
    // NOTE: we no longer write claim_email here because the column isn't yet
    // migrated. The verify endpoint uses vendor.email as the canonical
    // claimant email (see supabase/migrations/20260329_add_claim_email.sql).
    void email // kept for future: populate the claim_email column
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        claim_token: token,
        claim_token_expires_at: expiresAt,
        claim_status: 'pending',
      })
      .eq('id', vendor.id)

    if (updateError) {
      console.error('Token update error:', updateError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'
    const verifyUrl = `${siteUrl}/claim/verify?token=${token}`

    // Send verification email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Melaa <hello@melaa.ca>',
      to: email,
      subject: `Claim your Melaa listing — ${vendor.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f9f5f0;font-family:sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5f0;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
                  <!-- Header -->
                  <tr>
                    <td style="background:#C8A96A;padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Melaa</h1>
                      <p style="margin:8px 0 0;color:#fff3e8;font-size:14px;">South Asian Wedding Vendors · GTA</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">Verify your email to claim your listing</h2>
                      <p style="margin:0 0 12px;color:#555;font-size:16px;line-height:1.6;">
                        Hi there! You requested to claim the Melaa listing for <strong>${vendor.name}</strong>.
                      </p>
                      <p style="margin:0 0 32px;color:#555;font-size:16px;line-height:1.6;">
                        Click the button below to verify your email and continue setting up your listing. This link expires in <strong>24 hours</strong>.
                      </p>
                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                        <tr>
                          <td style="background:#C8A96A;border-radius:8px;">
                            <a href="${verifyUrl}" style="display:inline-block;padding:16px 36px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                              Verify &amp; Claim Listing →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 8px;color:#999;font-size:13px;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin:0 0 32px;word-break:break-all;">
                        <a href="${verifyUrl}" style="color:#C8A96A;font-size:13px;">${verifyUrl}</a>
                      </p>
                      <hr style="border:none;border-top:1px solid #f0e8df;margin:0 0 24px;">
                      <p style="margin:0;color:#bbb;font-size:12px;line-height:1.5;">
                        If you didn't request this, you can safely ignore this email. This link will expire in 24 hours.<br>
                        © Melaa · South Asian Wedding Directory · GTA
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('Claim email failed to send:', emailError)
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Claim initiate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
