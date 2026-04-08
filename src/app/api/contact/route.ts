import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml, rateLimit, clientIp, prune } from '@/lib/security'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    // Rate limit: 3 submissions per 10 minutes per IP
    prune()
    const ip = clientIp(req)
    if (!rateLimit(`contact:${ip}`, 3, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Reject obvious length-abuse
    if (String(name).length > 120 || String(subject).length > 200 || String(message).length > 5000) {
      return NextResponse.json({ error: 'Input too long.' }, { status: 400 })
    }

    // Send to hello@melaa.ca
    await resend.emails.send({
      from: 'Melaa Contact <hello@melaa.ca>',
      to: 'hello@melaa.ca',
      replyTo: email,
      subject: `[Contact] ${escapeHtml(subject)} — ${escapeHtml(name)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#C8A96A;margin-bottom:4px;">New Contact Form Submission</h2>
          <p style="color:#666;font-size:14px;margin-bottom:24px;">From melaa.ca/contact</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#999;width:80px;">Name</td><td style="padding:8px 0;color:#333;font-weight:600;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 0;color:#999;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#C8A96A;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#999;">Subject</td><td style="padding:8px 0;color:#333;">${escapeHtml(subject)}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f9f7f4;border-radius:12px;border:1px solid #eee;">
            <p style="color:#999;font-size:12px;margin:0 0 8px;">Message</p>
            <p style="color:#333;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <p style="color:#ccc;font-size:11px;margin-top:24px;">Reply directly to this email to respond to ${escapeHtml(name)}.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}
