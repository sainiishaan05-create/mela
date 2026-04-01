/**
 * SALES AGENT
 * Role: Convert free vendors to paid via nurture sequence, reactivate sleeping vendors, close upgrades
 * Schedule: Every Tuesday + Friday 9am UTC
 *
 * Tasks:
 * 1. Nurture sequence — Day 1, 7, 14, 30, 60, 85, 90 emails to free vendors
 * 2. Score free vendors and pitch top 5 most likely to convert
 * 3. Reactivate sleeping vendors (joined >14 days, zero leads)
 * 4. Annual plan pitch to 3-month Basic subscribers
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const resend = new Resend(process.env.RESEND_API_KEY)
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melaa.ca'

export const dynamic = 'force-dynamic'

async function ai(prompt: string, tokens = 300): Promise<string> {
  try {
    const r = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: tokens,
      messages: [{ role: 'user', content: prompt }],
    })
    return (r.content[0] as { type: string; text: string }).text
  } catch { return '' }
}

async function logAction(agent: string, action: string) {
  await supabase.from('agent_logs').insert({ agent, action })
}

// Nurture email configs per day
const NURTURE_DAYS = [1, 7, 14, 30, 60, 85, 90]

function getNurtureConfig(day: number): { subject: string; theme: string } | null {
  switch (day) {
    case 1: return {
      subject: 'Welcome to Melaa — your profile is live 🎉',
      theme: 'Welcome email. Their profile is now live on melaa.ca. Share 2 quick tips to help them get their first inquiry: (1) add portfolio photos, (2) write a description that mentions their specialty and city. Keep it warm and helpful. No sales pitch.',
    }
    case 7: return {
      subject: 'A quick tip to help couples find you on Melaa',
      theme: 'Helpful tip. Couples search by city and category. Share one actionable tip: vendors with photos in their profile get noticed more. Encourage them to add 3-5 photos if they haven\'t yet. Friendly, no pressure.',
    }
    case 14: return {
      subject: 'How\'s your Melaa profile going?',
      theme: 'Friendly check-in. Ask how things are going. Mention that completing their profile (description, photos, Instagram link) helps couples find them. Offer to help if they have questions — reply to this email. Warm, personal tone.',
    }
    case 30: return {
      subject: 'You\'ve been on Melaa a month — thank you 🙏',
      theme: '30-day thank-you. Thank them for being part of Melaa. Mention that a Founding Member plan exists at $49/mo for vendors who want priority placement and more visibility — no pressure, just letting them know it\'s there if they\'re interested. Keep it light.',
    }
    case 60: return {
      subject: 'Thinking of upgrading? Here\'s what Founding Members get',
      theme: 'Honest info about the Founding Member plan. Explain clearly: $49/mo (our lowest rate ever), priority placement in search results, verified badge, featured in category pages. No fake urgency — just honest information so they can decide if it\'s right for them.',
    }
    case 85: return {
      subject: 'Just so you know — the $49/mo founding rate',
      theme: 'Gentle reminder that the Founding Member rate of $49/mo is the lowest Melaa will ever offer. After the founding period closes, pricing will increase. No pressure — they can stay on the free plan forever. Just want to make sure they have the information.',
    }
    case 90: return {
      subject: '3 months on Melaa — here\'s what\'s available',
      theme: 'Transparent update. They\'ve been on Melaa 3 months for free. Explain both options honestly: (1) stay free — always listed, couples can still find them, (2) upgrade to $49/mo Founding Member — priority placement and verified badge. Let them choose. No fake deadlines.',
    }
    default: return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== process.env.AGENT_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  const now = new Date()

  // ── Task 1: Nurture sequence ──────────────────────────────────────────────
  const { data: freeVendors } = await supabase
    .from('vendors')
    .select('id, name, email, slug, phone, website, instagram, description, category:categories(name), city:cities(name), created_at')
    .eq('tier', 'free')
    .eq('is_active', true)

  for (const vendor of freeVendors ?? []) {
    if (!vendor.email) continue
    const daysSinceSignup = Math.floor((Date.now() - new Date(vendor.created_at).getTime()) / (24 * 60 * 60 * 1000))
    const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'wedding vendor'
    const cityName = (vendor.city as unknown as { name: string } | null)?.name ?? 'GTA'

    // Check if this day matches a nurture touchpoint (±1 day window)
    for (const targetDay of NURTURE_DAYS) {
      if (Math.abs(daysSinceSignup - targetDay) > 1) continue

      // Check if we already sent this nurture (via agent_logs)
      const { data: existingLog } = await supabase
        .from('agent_logs')
        .select('id')
        .eq('agent', 'sales_nurture')
        .eq('action', `nurture_day${targetDay}:${vendor.id}`)
        .limit(1)

      if (existingLog && existingLog.length > 0) continue

      const config = getNurtureConfig(targetDay)
      if (!config) continue

      const emailBody = await ai(
        `Write a friendly, honest email to ${vendor.name}, a ${catName} in ${cityName} listed on Melaa.ca (melaa.ca).
        Day ${targetDay} of their time on Melaa. Task: ${config.theme}

        STRICT RULES — you MUST follow these:
        - Never use fake urgency, countdown language, or pressure tactics
        - Never imply their leads are blocked or hidden behind a paywall — they are NOT
        - Never write a "Subject:" line — just the email body
        - Never make up statistics or fake claims
        - Be warm, honest, and genuinely helpful
        - Keep it under 120 words
        - Sign as "Ishaan, Founder of Melaa"
        - Only mention the $49/mo plan if the theme specifically asks for it`, 300
      )

      if (!emailBody) continue

      await resend.emails.send({
        from: 'Ishaan at Melaa <hello@melaa.ca>',
        to: vendor.email,
        subject: config.subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          ${emailBody.split('\n\n').map(p => `<p style="color:#333;line-height:1.7">${p}</p>`).join('')}
          ${targetDay >= 30 ? `
          <div style="background:#1A1A1A;border-radius:12px;padding:20px;margin:24px 0;text-align:center">
            <p style="color:#C8A96A;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Founding Vendor Rate</p>
            <p style="color:white;font-size:36px;font-weight:bold;margin:4px 0">$49<span style="font-size:14px;color:#999">/mo</span></p>
            <p style="color:#666;margin:0;font-size:12px"><s style="color:#999">$197/mo</s> · Locked in forever · Cancel anytime</p>
          </div>
          <a href="${SITE}/pricing" style="display:block;text-align:center;background:#C8A96A;color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:bold">Claim Founding Rate →</a>
          ` : `<a href="${SITE}/dashboard" style="display:inline-block;background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;font-weight:bold;margin-top:8px">View My Profile →</a>`}
          <p style="color:#ccc;font-size:11px;margin-top:20px">Reply to unsubscribe from these updates.</p>
        </div>`,
      })

      await logAction('sales_nurture', `nurture_day${targetDay}:${vendor.id}`)
      results.push(`nurture_d${targetDay}:${vendor.name}`)
      break
    }
  }

  // ── Task 2: Score and pitch hot leads ─────────────────────────────────────
  const { data: allLeads } = await supabase
    .from('leads')
    .select('vendor_id, is_read, created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  type ScoredVendor = {
    id: string; name: string; email: string; slug: string;
    phone?: string; website?: string; instagram?: string; description?: string;
    category?: { name: string } | null; city?: { name: string } | null;
    created_at: string; score: number; leadCount: number;
  }

  const scored: ScoredVendor[] = (freeVendors ?? []).map(v => {
    const vendorLeads = (allLeads ?? []).filter(l => l.vendor_id === v.id)
    const leadCount = vendorLeads.length
    const readRate = leadCount > 0 ? vendorLeads.filter(l => l.is_read).length / leadCount : 0
    const profileScore = [v.phone, v.website, v.instagram, v.description].filter(Boolean).length * 10
    const ageScore = Math.max(0, 30 - Math.floor((Date.now() - new Date(v.created_at).getTime()) / (24 * 60 * 60 * 1000)))
    const score = (leadCount * 20) + (readRate * 30) + profileScore + ageScore
    return { ...(v as unknown as ScoredVendor), score, leadCount }
  }).sort((a, b) => b.score - a.score)

  const hot = scored.slice(0, 5)
  for (const vendor of hot) {
    if (!vendor.email || vendor.leadCount === 0) continue
    const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'wedding vendor'
    const cityName = (vendor.city as unknown as { name: string } | null)?.name ?? 'GTA'

    const pitch = await ai(
      `Write a genuine, friendly email to ${vendor.name}, a ${catName} in ${cityName} on Melaa.ca.
      They've received ${vendor.leadCount} inquiries this month through their free listing — that's real traction.
      Mention this honestly and let them know a Founding Member plan ($49/mo) exists that gives them priority placement in search results and a verified badge — if they want more visibility.
      Be specific but never pushy. Don't invent urgency. Don't imply their current leads are limited or blocked.
      Sign as "Ishaan, Founder of Melaa". Under 100 words. No subject line — just the email body.`, 250
    )

    await resend.emails.send({
      from: 'Ishaan at Melaa <hello@melaa.ca>',
      to: vendor.email,
      subject: `${vendor.name} — you're getting leads, let's get you more`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        ${pitch.split('\n\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        <div style="background:#1A1A1A;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
          <p style="color:#C8A96A;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Founding Member Rate</p>
          <p style="color:white;font-size:36px;font-weight:bold;margin:4px 0">$49<span style="font-size:14px;color:#999">/mo</span></p>
          <p style="color:#666;margin:0;font-size:12px"><s style="color:#999">$197/mo</s> · Locked forever · Cancel anytime</p>
        </div>
        <a href="${SITE}/pricing" style="display:block;text-align:center;background:#C8A96A;color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:bold">Claim Founding Rate →</a>
        <p style="color:#bbb;font-size:11px;margin-top:16px">Reply to unsubscribe.</p>
      </div>`,
    })
    results.push(`sales_pitch:${vendor.name}(score:${Math.round(vendor.score)})`)
    await logAction('sales', `hot_pitch:${vendor.name}`)
  }

  // ── Task 3: Reactivate sleeping vendors ────────────────────────────────────
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: sleeping } = await supabase
    .from('vendors')
    .select('id, name, email, slug, category:categories(name), city:cities(name)')
    .eq('tier', 'free')
    .eq('is_active', true)
    .lte('created_at', fourteenDaysAgo)

  const vendorsWithLeads = new Set((allLeads ?? []).map(l => l.vendor_id))
  const sleepingVendors = (sleeping ?? []).filter(v => !vendorsWithLeads.has(v.id))

  for (const vendor of sleepingVendors.slice(0, 8)) {
    if (!vendor.email) continue
    const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'wedding services'
    const cityName = (vendor.city as unknown as { name: string } | null)?.name ?? 'GTA'

    const reactivation = await ai(
      `Write a short, helpful email to ${vendor.name}, a ${catName} in ${cityName} on Melaa.ca who hasn't received leads yet.
      Give 2 specific tips to get their first inquiry: (1) add a photo or portfolio, (2) write a stronger description with what makes them unique.
      Warm, practical, 80 words max. Sign as "Ishaan from Melaa".`
    )

    await resend.emails.send({
      from: 'Ishaan at Melaa <hello@melaa.ca>',
      to: vendor.email,
      subject: `Quick tip to get your first inquiry on Melaa`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        ${reactivation.split('\n\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        <a href="${SITE}/dashboard" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px">Update My Profile →</a>
      </div>`,
    })
    results.push(`reactivation:${vendor.name}`)
    await logAction('sales', `reactivation:${vendor.name}`)
  }

  // ── Task 4: Annual plan pitch to 3-month Basic subscribers ────────────────
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: basicVendors } = await supabase
    .from('vendors')
    .select('name, email')
    .eq('tier', 'basic')
    .lte('created_at', threeMonthsAgo)
    .limit(10)

  for (const vendor of basicVendors ?? []) {
    if (!vendor.email) continue
    await resend.emails.send({
      from: 'Ishaan at Melaa <hello@melaa.ca>',
      to: vendor.email,
      subject: `Save on your Melaa membership — annual billing offer`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#C8A96A">You've been with Melaa 3 months — thank you!</h2>
        <p style="color:#333;line-height:1.6">As one of our earliest members, I want to offer you annual billing: <strong>pay for 10 months, get 12</strong> — you save 2 months free and lock in your current rate forever.</p>
        <p style="color:#333;line-height:1.6">Just reply to this email and I'll set it up for you personally within the hour.</p>
        <p style="color:#444">— Ishaan, Founder of Melaa</p>
      </div>`,
    })
    results.push(`annual_pitch:${vendor.name}`)
    await logAction('sales', `annual_pitch:${vendor.name}`)
  }

  return NextResponse.json({ ok: true, agent: 'sales', tasks: results, ran_at: now.toISOString() })
}
