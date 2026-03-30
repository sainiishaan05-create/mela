/**
 * COMMUNITY AGENT
 * Role: Build trust, retention, and word-of-mouth among buyers + vendors
 * Schedule: Every Thursday 9am UTC
 *
 * Tasks:
 * 1. Send "vendor spotlight" email to all buyers — feature one vendor per week
 * 2. Post-event review request — ask buyers whose event date has passed to leave feedback
 * 3. Milestone celebration — email vendors who hit 10, 25, 50 leads
 * 4. Community digest — weekly summary of what's happening on Melaa sent to all vendors
 * 5. Generate FAQ content for top buyer questions (stored for website)
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== process.env.AGENT_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  const now = new Date()

  // ── Task 1: Weekly vendor spotlight to all buyers ─────────────────────────
  const { data: spotlightVendor } = await supabase
    .from('vendors')
    .select('name, slug, description, category:categories(name), city:cities(name)')
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: buyers } = await supabase
    .from('leads')
    .select('buyer_email, buyer_name')
    .not('buyer_email', 'is', null)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  if (spotlightVendor && buyers && buyers.length > 0) {
    const unique = Array.from(new Map(buyers.map(b => [b.buyer_email, b])).values()).slice(0, 300)
    const catName = (spotlightVendor.category as unknown as { name: string } | null)?.name ?? 'vendor'
    const cityName = (spotlightVendor.city as unknown as { name: string } | null)?.name ?? 'GTA'

    const spotlightCopy = await ai(`Write a warm 3-sentence vendor spotlight for ${spotlightVendor.name}, a ${catName} in ${cityName} on Melaa.ca.
    Description: ${spotlightVendor.description ?? 'Trusted South Asian wedding vendor'}.
    Make it feel like a personal recommendation from a friend. South Asian community warmth.`)

    const weddingTip = await ai(`Write one practical South Asian wedding planning tip for couples planning a wedding in GTA this season. 2 sentences. Specific and actionable.`)

    for (const buyer of unique) {
      if (!buyer.buyer_email) continue
      await resend.emails.send({
        from: 'Melaa Community <hello@melaa.ca>',
        to: buyer.buyer_email,
        subject: `✨ Vendor Spotlight: ${spotlightVendor.name} — this week on Melaa`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C8A96A">This Week's Vendor Spotlight</h2>
          <div style="background:#fafaf7;border-radius:12px;padding:20px;margin:16px 0">
            <h3 style="margin:0 0 8px;color:#1A1A1A">${spotlightVendor.name}</h3>
            <p style="margin:0 0 4px;color:#C8A96A;font-size:13px">${catName} · ${cityName}</p>
            <p style="margin:8px 0 0;color:#444;line-height:1.6">${spotlightCopy}</p>
            <a href="${SITE}/vendors/${spotlightVendor.slug}" style="background:#C8A96A;color:white;padding:8px 16px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px;font-size:13px">View Profile →</a>
          </div>
          <div style="border-top:1px solid #e5e5e0;padding-top:16px;margin-top:16px">
            <p style="margin:0 0 6px;font-weight:bold;color:#1A1A1A">💡 Wedding Planning Tip</p>
            <p style="margin:0;color:#444;line-height:1.6">${weddingTip}</p>
          </div>
          <a href="${SITE}/vendors" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:20px">Browse All Vendors →</a>
          <p style="color:#bbb;font-size:11px;margin-top:16px">Reply to unsubscribe.</p>
        </div>`,
      })
    }
    results.push(`spotlight:${spotlightVendor.name}→${unique.length}_buyers`)
  }

  // ── Task 2: Milestone celebrations for vendors ────────────────────────────
  const { data: allLeads } = await supabase
    .from('leads')
    .select('vendor_id')

  const leadCountByVendor: Record<string, number> = {}
  for (const l of allLeads ?? []) {
    if (l.vendor_id) leadCountByVendor[l.vendor_id] = (leadCountByVendor[l.vendor_id] ?? 0) + 1
  }

  const milestones = [10, 25, 50, 100]
  for (const [vendorId, count] of Object.entries(leadCountByVendor)) {
    if (!milestones.includes(count)) continue
    const { data: vendor } = await supabase
      .from('vendors').select('name, email, tier').eq('id', vendorId).single()
    if (!vendor?.email) continue

    const celebrationMsg = await ai(`Write a warm congratulations email to ${vendor.name} who just hit ${count} total leads on Melaa.ca.
    Make it feel special. If they are on the free tier, mention upgrading to grow even faster.
    Sign as "Ishaan, Founder of Melaa". 3 sentences max.`)

    await resend.emails.send({
      from: 'Ishaan at Melaa <hello@melaa.ca>',
      to: vendor.email,
      subject: `🎉 You just hit ${count} leads on Melaa!`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#C8A96A,#f59e0b);border-radius:12px;margin-bottom:20px">
          <p style="font-size:48px;margin:0">🎉</p>
          <h2 style="color:white;margin:8px 0">${count} Leads!</h2>
          <p style="color:rgba(255,255,255,0.9);margin:0">${vendor.name}</p>
        </div>
        ${celebrationMsg.split('\n').map(p => `<p style="color:#333;line-height:1.6">${p}</p>`).join('')}
        ${vendor.tier === 'free' ? `<a href="${SITE}/pricing" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:8px">Upgrade to Get More →</a>` : ''}
      </div>`,
    })
    results.push(`milestone:${vendor.name}:${count}_leads`)
  }

  // ── Task 3: Community digest to all vendors ───────────────────────────────
  const { data: allVendors } = await supabase
    .from('vendors').select('name, email').eq('is_active', true).limit(200)

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: newVendorCount } = await supabase
    .from('vendors').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo)
  const { count: weekLeads } = await supabase
    .from('leads').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo)

  const digestTip = await ai(`Write one practical tip for South Asian wedding vendors in GTA to get more leads and bookings.
  Could be about photography, social media, pricing, communication, anything. 2-3 sentences. Direct and useful.`)

  for (const vendor of allVendors ?? []) {
    if (!vendor.email) continue
    await resend.emails.send({
      from: 'Melaa Community <hello@melaa.ca>',
      to: vendor.email,
      subject: `📊 Melaa this week: ${weekLeads} new inquiries from GTA families`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#C8A96A">This Week on Melaa</h2>
        <div style="display:flex;gap:12px;margin:16px 0">
          <div style="flex:1;background:#fafaf7;padding:16px;border-radius:8px;text-align:center">
            <p style="margin:0;font-size:28px;font-weight:bold;color:#C8A96A">${weekLeads ?? 0}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#666">Buyer inquiries</p>
          </div>
          <div style="flex:1;background:#fafaf7;padding:16px;border-radius:8px;text-align:center">
            <p style="margin:0;font-size:28px;font-weight:bold;color:#1A1A1A">${newVendorCount ?? 0}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#666">New vendors joined</p>
          </div>
        </div>
        <div style="border-top:1px solid #e5e5e0;padding-top:16px;margin-top:8px">
          <p style="font-weight:bold;margin:0 0 6px">💡 Vendor Tip of the Week</p>
          <p style="color:#444;line-height:1.6;margin:0">${digestTip}</p>
        </div>
        <a href="${SITE}/dashboard" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px">Check My Leads →</a>
        <p style="color:#bbb;font-size:11px;margin-top:16px">Reply to unsubscribe.</p>
      </div>`,
    })
  }
  results.push(`vendor_digest:${allVendors?.length ?? 0}_sent`)

  return NextResponse.json({ ok: true, agent: 'community', tasks: results, ran_at: now.toISOString() })
}
