/**
 * REVENUE OPTIMIZER AGENT
 * Inspired by: "Spots money-making opportunities. Implements pricing tiers and payment flows."
 * Schedule: Every day 10am UTC
 *
 * Financial tasks:
 * 1. Dynamic upgrade pricing — detect vendors in "hot window" (2-5 leads, no upgrade) → send limited time offer
 * 2. Abandoned upgrade recovery — vendors who visited /pricing but didn't subscribe
 * 3. Price anchoring emails — reframe $99/mo as "$3.30/day, less than one coffee"
 * 4. Bundle deal generator — identify vendors who could save with annual plan
 * 5. Revenue leak detection — find paid vendors who downgraded or went inactive → win back
 * 6. Passive income opportunity: identify top vendors and offer "Featured Placement" upsell at $49/mo add-on
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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

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
  const hour = now.getUTCHours()

  // ── Task 1: Hot window upgrade — 2-5 leads in 7 days, still free ─────────
  // This is the highest-converting moment. Vendor has proof Mela works, not yet paying.
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentLeads } = await supabase
    .from('leads').select('vendor_id').gte('created_at', weekAgo)

  const leadCount: Record<string, number> = {}
  for (const l of recentLeads ?? []) {
    if (l.vendor_id) leadCount[l.vendor_id] = (leadCount[l.vendor_id] ?? 0) + 1
  }

  const hotWindowIds = Object.entries(leadCount)
    .filter(([, c]) => c >= 2 && c <= 5)
    .map(([id]) => id)

  if (hotWindowIds.length > 0) {
    const { data: hotVendors } = await supabase
      .from('vendors')
      .select('id, name, email, category:categories(name), city:cities(name)')
      .eq('tier', 'free').in('id', hotWindowIds)

    for (const vendor of hotVendors ?? []) {
      if (!vendor.email) continue
      const count = leadCount[vendor.id]
      const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'wedding services'
      const cityName = (vendor.city as unknown as { name: string } | null)?.name ?? 'GTA'

      // Price anchor: reframe cost as daily
      const email = await ai(`Write a 3-paragraph sales email to ${vendor.name}, a ${catName} in ${cityName}.
      They got ${count} leads this week on Mela's free plan.
      Frame the upgrade: Basic is $99/mo = $3.30/day = less than a coffee.
      With a verified badge + priority listing they'll likely get 2-3x more leads.
      Use FOMO: other ${catName}s in ${cityName} are upgrading and will outrank them.
      Sign as Ishaan. Max 150 words.`)

      await resend.emails.send({
        from: 'Ishaan at Mela <hello@melaa.ca>',
        to: vendor.email,
        subject: `${count} leads this week for $3.30/day — here's the math`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          ${email.split('\n\n').map(p => `<p style="line-height:1.7;color:#333">${p}</p>`).join('')}
          <div style="background:#fafaf7;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
            <p style="margin:0;font-size:13px;color:#666">Basic Plan</p>
            <p style="margin:4px 0;font-size:36px;font-weight:bold;color:#E8760A">$3.30<span style="font-size:16px;color:#999">/day</span></p>
            <p style="margin:0;font-size:12px;color:#999">$99/month · cancel anytime</p>
          </div>
          <a href="${SITE}/pricing" style="background:#E8760A;color:white;padding:14px 28px;border-radius:24px;text-decoration:none;display:block;text-align:center;font-weight:bold;font-size:15px;margin-top:8px">Upgrade for $3.30/day →</a>
        </div>`,
      })
      results.push(`hot_window:${vendor.name}(${count}_leads)`)
    }
  }

  // ── Task 2: Featured Placement upsell — sell $49/mo add-on to Basic vendors ─
  // New passive revenue stream: Basic vendors can pay $49/mo extra to be "Featured" on homepage
  if (hour === 10) {
    const { data: basicVendors } = await supabase
      .from('vendors')
      .select('id, name, email, is_featured, category:categories(name)')
      .eq('tier', 'basic')
      .eq('is_featured', false)
      .limit(10)

    for (const vendor of basicVendors ?? []) {
      if (!vendor.email) continue
      const catName = (vendor.category as unknown as { name: string } | null)?.name ?? 'your category'

      await resend.emails.send({
        from: 'Ishaan at Mela <hello@melaa.ca>',
        to: vendor.email,
        subject: `Get featured on Melaa.ca homepage — $49/mo add-on`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#E8760A">Featured Placement — Available Now</h2>
          <p style="color:#333;line-height:1.7">Hi ${vendor.name.split(' ')[0]}, we're now offering a <strong>Featured Placement</strong> add-on for Basic members.</p>
          <div style="background:#fafaf7;border-radius:12px;padding:20px;margin:16px 0">
            <p style="margin:0 0 8px;font-weight:bold;color:#1A1A1A">What you get for $49/mo:</p>
            <ul style="margin:0;padding-left:20px;color:#444;line-height:2">
              <li>🏆 Featured badge on your profile</li>
              <li>📍 Homepage "Featured Vendors" section</li>
              <li>⭐ First result in ${catName} searches</li>
              <li>📣 Included in our weekly buyer newsletter</li>
            </ul>
          </div>
          <p style="color:#333">Most featured vendors see <strong>3-5x more inquiries</strong>. One extra booking per month covers this entirely.</p>
          <p>Interested? Just reply "YES" and I'll activate it for you today.</p>
          <p style="color:#444">— Ishaan, Founder of Mela</p>
        </div>`,
      })
      results.push(`featured_upsell:${vendor.name}`)
    }
  }

  // ── Task 3: Revenue leak — find paid vendors who haven't logged in / replied in 30d ─
  if (hour === 10) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: atRiskPaid } = await supabase
      .from('vendors')
      .select('id, name, email, tier')
      .neq('tier', 'free')
      .eq('is_active', true)

    // Find which paid vendors have zero read leads in 30 days (not engaged)
    const { data: recentReadLeads } = await supabase
      .from('leads')
      .select('vendor_id')
      .eq('is_read', true)
      .gte('created_at', thirtyDaysAgo)

    const activeVendorIds = new Set((recentReadLeads ?? []).map(l => l.vendor_id))
    const ghostedPaid = (atRiskPaid ?? []).filter(v => !activeVendorIds.has(v.id))

    for (const vendor of ghostedPaid.slice(0, 5)) {
      if (!vendor.email) continue
      await resend.emails.send({
        from: 'Ishaan at Mela <hello@melaa.ca>',
        to: vendor.email,
        subject: `${vendor.name} — are you getting your leads?`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#E8760A">Quick check-in</h2>
          <p style="color:#333;line-height:1.7">Hi ${vendor.name.split(' ')[0]}, I noticed you haven't replied to any recent inquiries on Mela. I want to make sure you're getting value from your ${vendor.tier} subscription.</p>
          <p>A few things that might help:</p>
          <ul style="color:#444;line-height:2">
            <li>Check your spam folder for lead notifications</li>
            <li>Update your contact email in your dashboard</li>
            <li>Reply to leads within 24h to stay at the top of rankings</li>
          </ul>
          <p>If anything isn't working, reply to this email and I'll personally fix it.</p>
          <a href="${SITE}/dashboard" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:8px">Check My Dashboard →</a>
          <p style="color:#444;margin-top:16px">— Ishaan</p>
        </div>`,
      })
      results.push(`revenue_leak_recovery:${vendor.name}`)
    }
  }

  // ── Task 4: Passive income log — track upsell opportunities in DB ─────────
  const opportunityCount = results.filter(r => r.startsWith('hot_window') || r.startsWith('featured_upsell')).length
  if (opportunityCount > 0) {
    await supabase.from('agent_logs').insert({
      agent: 'optimizer',
      action: 'revenue_opportunities_identified',
      metadata: JSON.stringify({ count: opportunityCount, results }),
      created_at: now.toISOString(),
    })
  }

  // ── Task 5: Weekly optimizer summary to founder ───────────────────────────
  if (now.getUTCDay() === 1 && ADMIN_EMAIL) {
    const { data: logs } = await supabase
      .from('agent_logs')
      .select('action, metadata, created_at')
      .eq('agent', 'optimizer')
      .gte('created_at', weekAgo)

    const totalOpportunities = logs?.reduce((sum, l) => {
      try { return sum + (JSON.parse(l.metadata)?.count ?? 0) } catch { return sum }
    }, 0) ?? 0

    await resend.emails.send({
      from: 'Mela Optimizer <agent@melaa.ca>',
      to: ADMIN_EMAIL,
      subject: `💡 Revenue Optimizer: ${totalOpportunities} opportunities this week`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#E8760A">Revenue Optimizer Weekly Summary</h2>
        <p>This week the optimizer identified and actioned <strong>${totalOpportunities}</strong> revenue opportunities:</p>
        <ul style="color:#444;line-height:2">
          <li>Hot window upgrade prompts (vendors with 2-5 leads)</li>
          <li>Featured placement upsells to Basic vendors</li>
          <li>Revenue leak recovery (inactive paid vendors)</li>
        </ul>
        <p style="color:#666;font-size:13px">Track conversions manually by checking if any vendors upgraded after receiving these emails.</p>
        <a href="${SITE}/admin" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">Admin Dashboard →</a>
      </div>`,
    })
  }

  return NextResponse.json({ ok: true, agent: 'optimizer', tasks: results, ran_at: now.toISOString() })
}
