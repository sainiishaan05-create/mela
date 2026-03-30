/**
 * Melaa AI Agent — runs every 6 hours via Vercel Cron
 *
 * Equity-building tasks:
 * 1.  Daily lead digest to vendors
 * 2.  48h nudge for unanswered leads
 * 3.  Upgrade prompt — free vendors with 3+ leads this week
 * 4.  New vendor welcome sequence (day 1 / day 3 / day 7)
 * 5.  Outreach follow-up — vendors contacted but not listed after 3 days
 * 6.  Weekly SEO blog — generate + save to blog_drafts
 * 7.  Churn prevention — vendors whose subscription ends in 7 days
 * 8.  Vendor quality scoring — response rate + profile completeness stored in DB (data moat)
 * 9.  Supply/demand gap report — emails founder where demand exceeds supply
 * 10. Weekly founder intelligence report — revenue, leads, vendor health, gaps
 * 11. Buyer re-engagement — buyers whose vendor never replied get offered alternatives
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

async function aiText(prompt: string, maxTokens = 200): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })
    return (res.content[0] as { type: string; text: string }).text
  } catch {
    return ''
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== process.env.AGENT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []
  const now = new Date()
  const hour = now.getUTCHours()
  const day = now.getUTCDay() // 0=Sun

  // ─── Task 1: Daily lead digest (9am UTC) ──────────────────────────────────
  if (hour === 9) {
    const { data: unreadLeads } = await supabase
      .from('leads')
      .select('*, vendor:vendors(id, name, email, slug)')
      .eq('is_read', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (unreadLeads && unreadLeads.length > 0) {
      const byVendor = unreadLeads.reduce((acc: Record<string, typeof unreadLeads>, lead) => {
        const vid = lead.vendor?.id
        if (!vid) return acc
        if (!acc[vid]) acc[vid] = []
        acc[vid].push(lead)
        return acc
      }, {})

      for (const [, leads] of Object.entries(byVendor)) {
        const vendor = leads[0].vendor
        if (!vendor?.email) continue
        const msg = await aiText(`One warm motivating sentence for wedding vendor "${vendor.name}" who got ${leads.length} new inquiry(ies) today on Melaa.ca.`)
        await resend.emails.send({
          from: 'Melaa Agent <agent@melaa.ca>',
          to: vendor.email,
          subject: `You have ${leads.length} new inquiry${leads.length > 1 ? 's' : ''} today 🎉`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#C8A96A">Daily Lead Digest</h2>
            ${msg ? `<p style="font-style:italic;color:#666">${msg}</p>` : ''}
            <p><strong>${leads.length}</strong> new inquiry${leads.length > 1 ? 's' : ''} in the last 24h:</p>
            ${leads.map((l: { buyer_name: string; event_type: string | null }) => `<p>• <strong>${l.buyer_name}</strong> — ${l.event_type ?? 'Wedding'}</p>`).join('')}
            <a href="${SITE}/dashboard" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">View in Dashboard →</a>
          </div>`,
        })
        results.push(`digest:${vendor.name}`)
      }
    }
  }

  // ─── Task 2: 48h nudge (9am UTC) ─────────────────────────────────────────
  if (hour === 9) {
    const { data: oldLeads } = await supabase
      .from('leads')
      .select('*, vendor:vendors(id, name, email)')
      .eq('is_read', false)
      .lte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

    if (oldLeads && oldLeads.length > 0) {
      const vendorIds = [...new Set(oldLeads.map(l => l.vendor?.id).filter(Boolean))]
      for (const vid of vendorIds) {
        const vendorLeads = oldLeads.filter(l => l.vendor?.id === vid)
        const vendor = vendorLeads[0].vendor
        if (!vendor?.email) continue
        await resend.emails.send({
          from: 'Melaa Agent <agent@melaa.ca>',
          to: vendor.email,
          subject: `⏰ ${vendorLeads.length} inquiry${vendorLeads.length > 1 ? 's' : ''} waiting 48h+`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#C8A96A">Don't lose these leads!</h2>
            <p>You have <strong>${vendorLeads.length}</strong> unanswered inquiry${vendorLeads.length > 1 ? 's' : ''} from over 48 hours ago. Buyers who don't hear back often go with another vendor.</p>
            <a href="${SITE}/dashboard" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Reply Now →</a>
          </div>`,
        })
        results.push(`nudge:${vendor.name}`)
      }
    }
  }

  // ─── Task 3: Upgrade prompt — free vendors with 3+ leads this week (3pm) ──
  if (hour === 15) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: leads } = await supabase
      .from('leads').select('vendor_id').gte('created_at', weekAgo)

    if (leads && leads.length > 0) {
      const countByVendor: Record<string, number> = {}
      for (const l of leads) {
        if (l.vendor_id) countByVendor[l.vendor_id] = (countByVendor[l.vendor_id] ?? 0) + 1
      }
      const hotIds = Object.entries(countByVendor).filter(([, c]) => c >= 3).map(([id]) => id)
      if (hotIds.length > 0) {
        const { data: freeVendors } = await supabase
          .from('vendors').select('id, name, email').eq('tier', 'free').in('id', hotIds)
        for (const vendor of freeVendors ?? []) {
          const count = countByVendor[vendor.id]
          const pitch = await aiText(`2-sentence upgrade pitch for "${vendor.name}", free-tier wedding vendor on Melaa.ca who got ${count} leads this week. Push Basic ($99/mo) for priority + verified badge. Warm, direct.`)
          await resend.emails.send({
            from: 'Melaa <hello@melaa.ca>',
            to: vendor.email,
            subject: `${count} leads this week — you're ready to upgrade 🚀`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#C8A96A">You're getting traction!</h2>
              <p>${pitch}</p>
              <ul style="color:#444"><li>✅ Verified badge</li><li>✅ Priority placement</li><li>✅ Featured on category pages</li></ul>
              <a href="${SITE}/pricing" style="background:#C8A96A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Upgrade for $99/mo →</a>
            </div>`,
          })
          results.push(`upgrade_prompt:${vendor.name}`)
        }
      }
    }
  }

  // ─── Task 4: Welcome sequence day 1 / day 3 / day 7 (10am UTC) ───────────
  if (hour === 10) {
    for (const daysAgo of [1, 3, 7]) {
      const start = new Date(Date.now() - (daysAgo * 24 + 1) * 60 * 60 * 1000).toISOString()
      const end = new Date(Date.now() - (daysAgo * 24 - 1) * 60 * 60 * 1000).toISOString()
      const { data: vendors } = await supabase
        .from('vendors').select('id, name, email, slug').gte('created_at', start).lte('created_at', end)

      for (const vendor of vendors ?? []) {
        let subject = '', html = ''
        if (daysAgo === 1) {
          subject = `Welcome to Melaa, ${vendor.name} 👋`
          html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#C8A96A">You're live on Melaa.ca!</h2>
            <p>Your profile is now visible to South Asian families across the GTA.</p>
            <ol><li>View your profile: <a href="${SITE}/vendors/${vendor.slug}">${SITE}/vendors/${vendor.slug}</a></li>
            <li>Share it on your Instagram stories</li>
            <li>Ask past clients to send inquiries through Melaa to build reputation</li></ol>
            <a href="${SITE}/dashboard" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Go to Dashboard →</a>
          </div>`
        } else if (daysAgo === 3) {
          subject = `How's it going, ${vendor.name.split(' ')[0]}?`
          html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#C8A96A">Quick check-in</h2>
            <p>3 days in. Vendors who upgrade to Basic get a Verified badge and show up first in search — more inquiries, less competition.</p>
            <a href="${SITE}/pricing" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">See Upgrade Options →</a>
          </div>`
        } else {
          subject = `1 week on Melaa — here's how to get more leads`
          html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#C8A96A">You've been live 1 week!</h2>
            <ul><li>Add a portfolio description</li><li>Link Melaa in your Instagram bio</li><li>Upgrade to appear at the top of your category</li></ul>
            <a href="${SITE}/pricing" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Upgrade →</a>
          </div>`
        }
        await resend.emails.send({ from: 'Ishaan at Melaa <hello@melaa.ca>', to: vendor.email, subject, html })
        results.push(`welcome_day${daysAgo}:${vendor.name}`)
      }
    }
  }

  // ─── Task 5: Outreach follow-up (2pm UTC) ────────────────────────────────
  if (hour === 14) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const { data: stale } = await supabase
      .from('outreach').select('*').eq('status', 'contacted').lte('created_at', threeDaysAgo)
    for (const lead of stale ?? []) {
      if (!lead.email) continue
      const followUp = await aiText(`2-sentence follow-up to ${lead.business_name}, a ${lead.category} in ${lead.city}, about listing free on Melaa.ca. Friendly, no pressure.`)
      await resend.emails.send({
        from: 'Ishaan at Melaa <hello@melaa.ca>',
        to: lead.email,
        subject: `Following up — free listing on Melaa.ca`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><p>${followUp}</p>
          <a href="${SITE}/list-your-business" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">List for Free →</a>
        </div>`,
      })
      results.push(`followup:${lead.business_name}`)
    }
  }

  // ─── Task 6: Weekly SEO blog (Sun 6am UTC) ────────────────────────────────
  if (day === 0 && hour === 6) {
    const categories = ['photographers', 'decorators', 'catering', 'makeup-artists', 'mehndi-artists', 'djs', 'florists']
    const cities = ['brampton', 'mississauga', 'toronto', 'markham', 'vaughan', 'oakville', 'richmond-hill']
    const cat = categories[Math.floor(Math.random() * categories.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const title = `Best South Asian Wedding ${cat.replace(/-/g, ' ')} in ${city.replace(/-/g, ' ')} (2025)`
    const content = await aiText(
      `Write a 400-word SEO blog post titled "${title}". Keyword 4-5 times naturally. Cover: what to look for, average prices, how to find them on Melaa.ca. South Asian community tone.`, 600
    )
    if (content) {
      await supabase.from('blog_drafts').insert({ title, slug: `${cat}-${city}-2025-${Date.now()}`, content, category: cat, city, status: 'draft' })
      results.push(`seo_blog:${cat}/${city}`)
    }
  }

  // ─── Task 7: Churn prevention (11am UTC) ─────────────────────────────────
  if (hour === 11) {
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: atRisk } = await supabase
      .from('vendors').select('name, email, tier').neq('tier', 'free')
      .lte('subscription_end_date', in7Days).gte('subscription_end_date', new Date().toISOString())
    for (const vendor of atRisk ?? []) {
      await resend.emails.send({
        from: 'Ishaan at Melaa <hello@melaa.ca>',
        to: vendor.email,
        subject: `Your Melaa ${vendor.tier} subscription renews in 7 days`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C8A96A">Thanks for being a ${vendor.tier} member!</h2>
          <p>Your subscription renews in 7 days. You'll keep your verified badge, priority placement, and direct inquiries from GTA families.</p>
          <a href="${SITE}/dashboard" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Dashboard →</a>
        </div>`,
      })
      results.push(`churn_prevention:${vendor.name}`)
    }
  }

  // ─── Task 8: Vendor quality scoring (runs every 6h — builds data moat) ────
  // Scores each vendor 0-100 based on response rate + profile completeness.
  // This data accumulates over time and becomes your ranking algorithm.
  {
    const { data: vendors } = await supabase
      .from('vendors').select('id, name, phone, website, instagram, description, portfolio_images, is_verified')

    const { data: allLeads } = await supabase
      .from('leads').select('vendor_id, is_read, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    for (const vendor of vendors ?? []) {
      const vendorLeads = (allLeads ?? []).filter(l => l.vendor_id === vendor.id)
      const totalLeads = vendorLeads.length
      const readLeads = vendorLeads.filter(l => l.is_read).length
      const responseRate = totalLeads > 0 ? Math.round((readLeads / totalLeads) * 100) : 50

      // Profile completeness (each field = points)
      let profileScore = 0
      if (vendor.description) profileScore += 25
      if (vendor.phone) profileScore += 15
      if (vendor.website) profileScore += 15
      if (vendor.instagram) profileScore += 15
      if (vendor.portfolio_images?.length > 0) profileScore += 20
      if (vendor.is_verified) profileScore += 10

      const qualityScore = Math.round((responseRate * 0.5) + (profileScore * 0.5))

      await supabase.from('vendor_scores').upsert({
        vendor_id: vendor.id,
        quality_score: qualityScore,
        response_rate: responseRate,
        profile_completeness: profileScore,
        scored_at: new Date().toISOString(),
      }, { onConflict: 'vendor_id' })
    }
    results.push(`scoring:${vendors?.length ?? 0}_vendors`)
  }

  // ─── Task 9: Supply/demand gap detection (Mon 7am UTC) ───────────────────
  // Finds categories+cities with buyer demand but no vendors. Emails YOU.
  if (day === 1 && hour === 7 && ADMIN_EMAIL) {
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('vendor:vendors(category:categories(name), city:cities(name))')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { data: activeVendors } = await supabase
      .from('vendors')
      .select('category:categories(name), city:cities(name)')
      .eq('is_active', true)

    // Count demand (leads) by category+city
    const demand: Record<string, number> = {}
    for (const lead of recentLeads ?? []) {
      const cat = (lead.vendor as { category?: { name: string }; city?: { name: string } })?.category?.name
      const city = (lead.vendor as { category?: { name: string }; city?: { name: string } })?.city?.name
      if (cat && city) {
        const key = `${cat} in ${city}`
        demand[key] = (demand[key] ?? 0) + 1
      }
    }

    // Count supply (vendors) by category+city
    const supply: Record<string, number> = {}
    for (const v of activeVendors ?? []) {
      const cat = (v.category as unknown as { name: string } | null)?.name
      const city = (v.city as unknown as { name: string } | null)?.name
      if (cat && city) {
        const key = `${cat} in ${city}`
        supply[key] = (supply[key] ?? 0) + 1
      }
    }

    // Find gaps: demand exists but supply is low
    const gaps = Object.entries(demand)
      .filter(([key, d]) => d >= 2 && (supply[key] ?? 0) <= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    if (gaps.length > 0) {
      const gapRows = gaps.map(([key, d]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${key}</td><td style="padding:8px;border-bottom:1px solid #eee;color:#C8A96A;font-weight:bold">${d} leads</td><td style="padding:8px;border-bottom:1px solid #eee;color:#666">${supply[key] ?? 0} vendors</td></tr>`).join('')
      await resend.emails.send({
        from: 'Melaa Agent <agent@melaa.ca>',
        to: ADMIN_EMAIL,
        subject: `📊 Weekly Supply/Demand Gap Report — ${gaps.length} opportunities`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C8A96A">Supply/Demand Gaps This Week</h2>
          <p>These category+city combos have buyer demand but not enough vendors. Focus your outreach here.</p>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr><th style="text-align:left;padding:8px;background:#f5f5f5">Segment</th><th style="text-align:left;padding:8px;background:#f5f5f5">Demand</th><th style="text-align:left;padding:8px;background:#f5f5f5">Supply</th></tr></thead>
            <tbody>${gapRows}</tbody>
          </table>
          <a href="${SITE}/admin/outreach" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px">Start Outreach →</a>
        </div>`,
      })
      results.push(`gap_report:${gaps.length}_gaps`)
    }
  }

  // ─── Task 10: Weekly founder intelligence report (Mon 8am UTC) ───────────
  if (day === 1 && hour === 8 && ADMIN_EMAIL) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: totalVendors },
      { count: newVendors },
      { count: totalLeads },
      { count: newLeads },
      { count: paidVendors },
      { data: topCategories },
    ] = await Promise.all([
      supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('vendors').select('*', { count: 'exact', head: true }).neq('tier', 'free'),
      supabase.from('leads').select('vendor:vendors(category:categories(name))').gte('created_at', weekAgo),
    ])

    // Top categories this week
    const catCount: Record<string, number> = {}
    for (const lead of topCategories ?? []) {
      const cat = (lead.vendor as { category?: { name: string } })?.category?.name
      if (cat) catCount[cat] = (catCount[cat] ?? 0) + 1
    }
    const topCats = Object.entries(catCount).sort(([, a], [, b]) => b - a).slice(0, 5)

    const mrr = (paidVendors ?? 0) * 99 // rough estimate
    const summary = await aiText(
      `Write a 2-sentence business summary for a founder: platform has ${totalVendors} vendors, ${newVendors} joined this week, ${newLeads} leads this week, ~$${mrr} MRR. South Asian wedding marketplace in GTA. Be concise and encouraging.`
    )

    await resend.emails.send({
      from: 'Melaa Agent <agent@melaa.ca>',
      to: ADMIN_EMAIL,
      subject: `📈 Melaa Weekly Report — ${newVendors} new vendors, ${newLeads} leads`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#C8A96A">Weekly Intelligence Report</h2>
        <p style="font-style:italic;color:#666">${summary}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:10px;background:#fafaf7;border-radius:8px;text-align:center"><p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Total Vendors</p><p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1A1A1A">${totalVendors}</p></td>
          <td style="width:8px"></td>
          <td style="padding:10px;background:#fafaf7;border-radius:8px;text-align:center"><p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">New This Week</p><p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#C8A96A">${newVendors}</p></td>
          <td style="width:8px"></td>
          <td style="padding:10px;background:#fafaf7;border-radius:8px;text-align:center"><p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Leads This Week</p><p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1A1A1A">${newLeads}</p></td>
          <td style="width:8px"></td>
          <td style="padding:10px;background:#fafaf7;border-radius:8px;text-align:center"><p style="margin:0;font-size:11px;color:#999;text-transform:uppercase">Est. MRR</p><p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#16a34a">$${mrr}</p></td></tr>
        </table>
        <h3 style="color:#1A1A1A">Top Categories This Week</h3>
        ${topCats.map(([cat, count]) => `<p style="margin:4px 0">• <strong>${cat}</strong> — ${count} leads</p>`).join('')}
        <div style="margin-top:16px">
          <a href="${SITE}/admin" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-right:8px">Admin Dashboard →</a>
          <a href="${SITE}/admin/outreach" style="background:#C8A96A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block">Run Outreach →</a>
        </div>
      </div>`,
    })
    results.push('founder_report:sent')
  }

  // ─── Task 11: Buyer re-engagement (Tue + Thu 10am UTC) ───────────────────
  // If a buyer's lead was never read after 72h, offer them alternative vendors
  if ((day === 2 || day === 4) && hour === 10) {
    const { data: ghostedLeads } = await supabase
      .from('leads')
      .select('*, vendor:vendors(name, category:categories(slug), city:cities(slug))')
      .eq('is_read', false)
      .lte('created_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
      .not('buyer_email', 'is', null)

    for (const lead of ghostedLeads ?? []) {
      const catSlug = (lead.vendor as { category?: { slug: string } })?.category?.slug
      const citySlug = (lead.vendor as { city?: { slug: string } })?.city?.slug
      if (!lead.buyer_email || !catSlug) continue

      await resend.emails.send({
        from: 'Melaa <hello@melaa.ca>',
        to: lead.buyer_email,
        subject: `Still looking for a vendor, ${lead.buyer_name?.split(' ')[0] ?? 'there'}?`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C8A96A">We noticed you haven't heard back yet</h2>
          <p>Hi ${lead.buyer_name ?? 'there'}, we saw your inquiry hasn't been answered yet. Browse other top-rated vendors who are available:</p>
          <a href="${SITE}/vendors?category=${catSlug}${citySlug ? `&city=${citySlug}` : ''}" style="background:#C8A96A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Find Other Vendors →</a>
          <p style="margin-top:16px;color:#999;font-size:12px">You submitted an inquiry on Melaa.ca. Reply to unsubscribe.</p>
        </div>`,
      })
      results.push(`buyer_reengagement:${lead.buyer_email}`)
    }
  }

  return NextResponse.json({ ok: true, tasks: results, ran_at: now.toISOString() })
}
