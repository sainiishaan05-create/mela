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
      subject: 'Welcome to Melaa — your profile is live',
      theme: 'Welcome + profile completion tips. Your profile is now live. Here are 3 things to do in the next 24 hours to get your first lead faster.',
    }
    case 7: return {
      subject: 'Your first week on Melaa — here\'s what\'s working',
      theme: 'Week 1 recap. Couples are searching for vendors like you. Here\'s how to make sure they find you first — add photos, complete your description.',
    }
    case 14: return {
      subject: 'Couples are booking — are you ready?',
      theme: 'Social proof. Vendors with complete profiles get 3x more leads. Here\'s exactly what a high-converting profile looks like.',
    }
    case 30: return {
      subject: 'Your 30-day Melaa check-in',
      theme: '30-day milestone. You\'ve been on Melaa for a month. Vendors who upgrade to Founding Member rate at $49/mo are now getting priority placement and unlimited leads.',
    }
    case 60: return {
      subject: '60 days in — don\'t miss the founding rate',
      theme: 'Urgency. You have 30 days left to lock in $49/mo forever before we raise to $197/mo. Here\'s what Founding Members are getting that free listings aren\'t.',
    }
    case 85: return {
      subject: '5 days left to lock in $49/mo forever',
      theme: 'Final warning. Your free trial ends in 5 days. Lock in $49/mo (regularly $197/mo) before midnight on day 90. After that, the founding rate is gone permanently.',
    }
    case 90: return {
      subject: 'Your free trial ends today — what now?',
      theme: 'Day 90 decision. Your 90-day free period is ending. Two options: lock in $49/mo founding rate now, or stay free with limited visibility. Here\'s the difference.',
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
        `Write a ${targetDay <= 14 ? 'helpful, warm' : targetDay >= 85 ? 'urgent, honest' : 'conversational'} email to ${vendor.name}, a ${catName} in ${cityName} on Melaa.ca.
        Day ${targetDay} of their free trial. Theme: ${config.theme}
        Founding Vendor offer: $49/mo (locked forever), regular price $197/mo. Free 90 days, no credit card.
        Keep it under 150 words. No fluff. Sign as "Ishaan, Founder of Melaa".`, 300
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
            <p style="color:#E8760A;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Founding Vendor Rate</p>
            <p style="color:white;font-size:36px;font-weight:bold;margin:4px 0">$49<span style="font-size:14px;color:#999">/mo</span></p>
            <p style="color:#666;margin:0;font-size:12px"><s style="color:#999">$197/mo</s> · Locked in forever · Cancel anytime</p>
          </div>
          <a href="${SITE}/pricing" style="display:block;text-align:center;background:#E8760A;color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:bold">Claim Founding Rate →</a>
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
      `Write a personalised 2-paragraph email to ${vendor.name}, a ${catName} in ${cityName} on Melaa.ca.
      They have ${vendor.leadCount} leads this month on the free plan — they're clearly getting traction.
      Pitch: upgrade to Founding Member ($49/mo, normally $197/mo, locked forever). Benefits: priority placement, unlimited leads, verified badge.
      Be specific about their situation. Sign as "Ishaan, Founder of Melaa". Under 120 words.`, 250
    )

    await resend.emails.send({
      from: 'Ishaan at Melaa <hello@melaa.ca>',
      to: vendor.email,
      subject: `${vendor.name} — you're getting leads, let's get you more`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        ${pitch.split('\n\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        <div style="background:#1A1A1A;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
          <p style="color:#E8760A;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Founding Member Rate</p>
          <p style="color:white;font-size:36px;font-weight:bold;margin:4px 0">$49<span style="font-size:14px;color:#999">/mo</span></p>
          <p style="color:#666;margin:0;font-size:12px"><s style="color:#999">$197/mo</s> · Locked forever · Cancel anytime</p>
        </div>
        <a href="${SITE}/pricing" style="display:block;text-align:center;background:#E8760A;color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:bold">Claim Founding Rate →</a>
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
        <h2 style="color:#E8760A">You've been with Melaa 3 months — thank you!</h2>
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
