import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml, rateLimit, clientIp, prune } from '@/lib/security'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    prune()
    if (!rateLimit(`leads-multi:${clientIp(req)}`, 3, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const { vendor_ids, buyer_name, buyer_email, buyer_phone, event_date, event_type, message } = body

    if (!Array.isArray(vendor_ids) || vendor_ids.length === 0 || vendor_ids.length > 3) {
      return NextResponse.json({ error: 'Select 1 to 3 vendors.' }, { status: 400 })
    }
    if (!buyer_name || !buyer_email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch all selected vendors in one query
    const { data: vendors, error: fetchErr } = await supabase
      .from('vendors')
      .select('*, category:categories(name), city:cities(name)')
      .in('id', vendor_ids)
      .eq('is_active', true)

    if (fetchErr || !vendors?.length) {
      return NextResponse.json({ error: 'Could not find the selected vendors.' }, { status: 404 })
    }

    // Insert one lead per vendor
    const rows = vendors.map(v => ({
      vendor_id: v.id,
      buyer_name,
      buyer_email,
      buyer_phone: buyer_phone || null,
      event_date: event_date || null,
      event_type: event_type || null,
      message,
    }))

    const { error: insertErr } = await supabase.from('leads').insert(rows)
    if (insertErr) throw insertErr

    // Send personalized emails to each vendor (in parallel, don't block on failures)
    const emailPromises = vendors
      .filter(v => v.email)
      .map(v => {
        const catName = Array.isArray(v.category) ? v.category[0]?.name : v.category?.name
        return resend.emails.send({
          from: 'Melaa <leads@melaa.ca>',
          to: v.email,
          subject: `New inquiry from ${escapeHtml(buyer_name)} for your ${escapeHtml(catName || '')} services`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#C8A96A;">New inquiry on Melaa</h2>
              <p>Hi <strong>${escapeHtml(v.name)}</strong>,</p>
              <p>You have a new inquiry from <strong>${escapeHtml(buyer_name)}</strong>.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;color:#666;">Name</td><td style="padding:8px;"><strong>${escapeHtml(buyer_name)}</strong></td></tr>
                <tr><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;">${escapeHtml(buyer_email)}</td></tr>
                ${buyer_phone ? `<tr><td style="padding:8px;color:#666;">Phone</td><td style="padding:8px;">${escapeHtml(buyer_phone)}</td></tr>` : ''}
                <tr><td style="padding:8px;color:#666;">Event</td><td style="padding:8px;">${escapeHtml(event_type || 'Not specified')}</td></tr>
                ${event_date ? `<tr><td style="padding:8px;color:#666;">Date</td><td style="padding:8px;">${escapeHtml(event_date)}</td></tr>` : ''}
                <tr><td style="padding:8px;color:#666;">Message</td><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(message)}</td></tr>
              </table>
              <a href="mailto:${escapeHtml(buyer_email)}" style="background:#C8A96A;color:white;padding:12px 24px;border-radius:24px;text-decoration:none;display:inline-block;margin-top:8px;">Reply to ${escapeHtml(buyer_name)}</a>
            </div>
          `,
        })
      })

    // One confirmation email to the buyer
    const vendorNames = vendors.map(v => v.name).join(', ')
    emailPromises.push(
      resend.emails.send({
        from: 'Melaa <hello@melaa.ca>',
        to: buyer_email,
        subject: `Your quote request was sent to ${vendors.length} vendor${vendors.length > 1 ? 's' : ''}!`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#C8A96A;">Quote request sent!</h2>
            <p>Hi ${escapeHtml(buyer_name)},</p>
            <p>Your request was sent to: <strong>${escapeHtml(vendorNames)}</strong>. They'll get back to you soon.</p>
            <p style="color:#666;">In the meantime, browse more vendors on Melaa.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://melaa.ca'}/vendors" style="background:#C8A96A;color:white;padding:12px 24px;border-radius:24px;text-decoration:none;display:inline-block;margin-top:8px;">Browse More Vendors</a>
          </div>
        `,
      })
    )

    await Promise.allSettled(emailPromises)

    return NextResponse.json({ success: true, sent_to: vendors.length })
  } catch (err) {
    console.error('Multi-lead error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
