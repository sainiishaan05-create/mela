/**
 * SALES AGENT
 * Role: Convert free vendors to paid, reactivate sleeping vendors, close upgrades
 * Schedule: Every Tuesday + Friday 9am UTC
 *
 * Tasks:
 * 1. Score every free vendor's upgrade likelihood (leads × profile × recency)
 * 2. Send hyper-personalized upgrade pitch to top 5 most likely to convert
 * 3. Reactivate sleeping vendors (signed up >14 days, zero leads, still free)
 * 4. Win-back churned paid vendors with a personalised offer
 * 5. Annual plan pitch to vendors who have been Basic for 3+ months
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

async function ai(prompt: string, tokens = 250): Promise<string> {
  try {
    const r = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: tokens,
      messages: [{ role: 'user', content: prompt }],
    })
    return (r.content[0] as { type: string; text: string }).text
  } catch { return '' }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== process.env.AGENT_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  const now = new Date()

  // ── Task 1 + 2: Score free vendors, pitch the hottest ones ───────────────
  const { data: freeVendors } = await supabase
    .from('vendors')
    .select('id, name, email, slug, phone, website, instagram, description, category:categories(name), city:cities(name), created_at')
    .eq('tier', 'free')
    .eq('is_active', true)

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

  // Pitch top 5 most likely to upgrade
  const hot = scored.slice(0, 5)
  for (const vendor of hot) {
    if (!vendor.email || vendor.leadCount === 0) continue
    const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'wedding vendor'
    const cityName = (vendor.city as unknown as { name: string } | null)?.name ?? 'GTA'

    const pitch = await ai(`Write a personalised 3-paragraph sales email to ${vendor.name}, a ${catName} in ${cityName} on Melaa.ca.
    They have ${vendor.leadCount} leads this month but are on the free tier.
    Make the case for upgrading to Basic ($99/mo): verified badge, priority listing, more leads.
    Use their specific situation. Sign off as "Ishaan, Founder of Mela". No fluff, results-focused.`, 350)

    await resend.emails.send({
      from: 'Ishaan at Mela <hello@melaa.ca>',
      to: vendor.email,
      subject: `${vendor.name} — you're leaving leads on the table`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        ${pitch.split('\n\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        <a href="${SITE}/pricing" style="background:#E8760A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px;font-weight:bold">Upgrade to Basic — $99/mo →</a>
        <p style="color:#bbb;font-size:11px;margin-top:20px">Reply to unsubscribe.</p>
      </div>`,
    })
    results.push(`sales_pitch:${vendor.name}(score:${Math.round(vendor.score)})`)
  }

  // ── Task 3: Reactivate sleeping vendors ────────────────────────────────────
  // Free vendors: joined >14 days ago, zero leads ever, no activity
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: sleeping } = await supabase
    .from('vendors')
    .select('id, name, email, slug, category:categories(name), city:cities(name)')
    .eq('tier', 'free')
    .eq('is_active', true)
    .lte('created_at', fourteenDaysAgo)

  const vendorsWithLeads = new Set((allLeads ?? []).map(l => l.vendor_id))
  const sleepingVendors = (sleeping ?? []).filter(v => !vendorsWithLeads.has(v.id))

  for (const vendor of sleepingVendors.slice(0, 10)) {
    if (!vendor.email) continue
    const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'wedding services'
    const cityName = (vendor.city as unknown as { name: string } | null)?.name ?? 'GTA'

    const reactivation = await ai(`Write a short re-engagement email to ${vendor.name}, a ${catName} in ${cityName} who listed on Melaa.ca but hasn't gotten any leads yet.
    Give 2 specific actionable tips to improve their profile and get leads. Warm, helpful, not salesy. Sign as "Ishaan from Mela".`)

    await resend.emails.send({
      from: 'Ishaan at Mela <hello@melaa.ca>',
      to: vendor.email,
      subject: `Quick tips to get your first inquiry on Mela`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        ${reactivation.split('\n\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        <a href="${SITE}/dashboard" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px">Update My Profile →</a>
      </div>`,
    })
    results.push(`reactivation:${vendor.name}`)
  }

  // ── Task 4: Annual plan pitch to 3-month Basic subscribers ────────────────
  // Vendors who have been paying for 3+ months → pitch annual ($990 vs $1188 = save $198)
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
      from: 'Ishaan at Mela <hello@melaa.ca>',
      to: vendor.email,
      subject: `Save $198 — switch to annual billing`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E8760A">You've been with Mela 3 months — thank you!</h2>
        <p>As a loyal member, we wanted to offer you annual billing: <strong>$990/year instead of $1,188</strong> — you save $198 and lock in your rate.</p>
        <p>Reply to this email and I'll manually set it up for you right away.</p>
        <p style="color:#444">— Ishaan, Founder of Mela</p>
      </div>`,
    })
    results.push(`annual_pitch:${vendor.name}`)
  }

  return NextResponse.json({ ok: true, agent: 'sales', tasks: results, ran_at: now.toISOString() })
}
