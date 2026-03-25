import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { vendor_id, buyer_name, buyer_email, buyer_phone, event_date, event_type, message } = body

    if (!vendor_id || !buyer_name || !buyer_email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get vendor info
    const { data: vendor } = await supabase
      .from('vendors')
      .select('*, category:categories(*), city:cities(*)')
      .eq('id', vendor_id)
      .single()

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    // Save lead to database
    const { error: leadError } = await supabase.from('leads').insert({
      vendor_id,
      buyer_name,
      buyer_email,
      buyer_phone: buyer_phone || null,
      event_date: event_date || null,
      event_type: event_type || null,
      message,
    })

    if (leadError) throw leadError

    // AI-draft a response email for the vendor using Claude
    let aiDraftedReply = ''
    try {
      const aiResponse = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `You are helping a South Asian wedding vendor named "${vendor.name}" (${vendor.category?.name} in ${vendor.city?.name}) draft a warm, professional reply to a new inquiry.

Buyer: ${buyer_name}
Event type: ${event_type}
Event date: ${event_date || 'not specified'}
Message: "${message}"

Write a short, warm reply email (3-4 sentences) from the vendor. Be culturally warm. Sign off as ${vendor.name}. No subject line, just the body.`,
        }],
      })
      aiDraftedReply = (aiResponse.content[0] as { type: string; text: string }).text
    } catch {
      // AI draft is optional — don't fail the lead if it errors
    }

    // Send notification email to vendor with AI-drafted reply
    if (vendor.email) {
      await resend.emails.send({
        from: 'Melaa <leads@melaa.ca>',
        to: vendor.email,
        subject: `New inquiry from ${buyer_name} — ${event_type}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #E8760A;">New inquiry on Melaa 🎉</h2>
            <p>You have a new inquiry from <strong>${buyer_name}</strong></p>
            <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
              <tr><td style="padding:8px; color:#666;">Name</td><td style="padding:8px;"><strong>${buyer_name}</strong></td></tr>
              <tr><td style="padding:8px; color:#666;">Email</td><td style="padding:8px;">${buyer_email}</td></tr>
              ${buyer_phone ? `<tr><td style="padding:8px; color:#666;">Phone</td><td style="padding:8px;">${buyer_phone}</td></tr>` : ''}
              <tr><td style="padding:8px; color:#666;">Event</td><td style="padding:8px;">${event_type}</td></tr>
              ${event_date ? `<tr><td style="padding:8px; color:#666;">Date</td><td style="padding:8px;">${event_date}</td></tr>` : ''}
              <tr><td style="padding:8px; color:#666;">Message</td><td style="padding:8px;">${message}</td></tr>
            </table>
            ${aiDraftedReply ? `
            <div style="background:#FFF8F0; border-left:4px solid #E8760A; padding:16px; margin:16px 0; border-radius:4px;">
              <p style="margin:0 0 8px; font-weight:bold; color:#E8760A;">✨ AI-drafted reply (edit and send):</p>
              <p style="margin:0; white-space:pre-wrap;">${aiDraftedReply}</p>
            </div>` : ''}
            <a href="mailto:${buyer_email}" style="background:#E8760A; color:white; padding:12px 24px; border-radius:24px; text-decoration:none; display:inline-block; margin-top:8px;">Reply to ${buyer_name}</a>
          </div>
        `,
      })
    }

    // Send confirmation email to buyer
    await resend.emails.send({
      from: 'Melaa <hello@melaa.ca>',
      to: buyer_email,
      subject: `Your inquiry to ${vendor.name} has been sent!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E8760A;">Inquiry sent! 🎉</h2>
          <p>Hi ${buyer_name},</p>
          <p>Your inquiry to <strong>${vendor.name}</strong> has been sent. They'll be in touch soon!</p>
          <p style="color:#666;">In the meantime, browse more vendors on Melaa.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/vendors" style="background:#E8760A; color:white; padding:12px 24px; border-radius:24px; text-decoration:none; display:inline-block; margin-top:8px;">Browse More Vendors</a>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
