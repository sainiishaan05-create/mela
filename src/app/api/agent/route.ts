/**
 * Mela AI Agent — runs every 6 hours via Vercel Cron
 *
 * Revenue tasks:
 * 1. Daily lead digest to vendors
 * 2. 48h nudge for unanswered leads
 * 3. Upgrade prompt — free vendors with 3+ leads this week
 * 4. New vendor welcome sequence (day 1 / day 3 / day 7)
 * 5. Outreach follow-up — ping vendors in outreach table who haven't listed after 3 days
 * 6. Weekly SEO blog post — generate + SAVE to Supabase blog_drafts table
 * 7. Churn prevention — vendors whose subscription ends in 7 days
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

  // ─── Task 1: Daily lead digest (runs at 9am UTC) ──────────────────────────
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
          from: 'Mela Agent <agent@melaa.ca>',
          to: vendor.email,
          subject: `You have ${leads.length} new inquiry${leads.length > 1 ? 's' : ''} today 🎉`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#E8760A">Daily Lead Digest</h2>
            ${msg ? `<p style="font-style:italic;color:#666">${msg}</p>` : ''}
            <p><strong>${leads.length}</strong> new inquiry${leads.length > 1 ? 's' : ''} in the last 24h:</p>
            ${leads.map((l: { buyer_name: string; event_type: string | null }) => `<p>• <strong>${l.buyer_name}</strong> — ${l.event_type ?? 'Wedding'}</p>`).join('')}
            <a href="${SITE}/dashboard" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">View in Dashboard →</a>
          </div>`,
        })
        results.push(`digest:${vendor.name}`)
      }
    }
  }

  // ─── Task 2: 48h nudge (runs at 9am UTC) ─────────────────────────────────
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
          from: 'Mela Agent <agent@melaa.ca>',
          to: vendor.email,
          subject: `⏰ ${vendorLeads.length} inquiry${vendorLeads.length > 1 ? 's' : ''} waiting 48h+ — don't lose these leads`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#E8760A">Don't lose these leads!</h2>
            <p>You have <strong>${vendorLeads.length}</strong> unanswered inquiry${vendorLeads.length > 1 ? 's' : ''} from over 48 hours ago. Buyers who don't hear back often go with another vendor.</p>
            <a href="${SITE}/dashboard" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Reply Now →</a>
          </div>`,
        })
        results.push(`nudge:${vendor.name}`)
      }
    }
  }

  // ─── Task 3: Upgrade prompt — free vendors with 3+ leads this week ────────
  if (hour === 15) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: leads } = await supabase
      .from('leads')
      .select('vendor_id')
      .gte('created_at', weekAgo)

    if (leads && leads.length > 0) {
      const countByVendor: Record<string, number> = {}
      for (const l of leads) {
        if (l.vendor_id) countByVendor[l.vendor_id] = (countByVendor[l.vendor_id] ?? 0) + 1
      }

      const hotVendorIds = Object.entries(countByVendor)
        .filter(([, count]) => count >= 3)
        .map(([id]) => id)

      if (hotVendorIds.length > 0) {
        const { data: freeVendors } = await supabase
          .from('vendors')
          .select('id, name, email')
          .eq('tier', 'free')
          .in('id', hotVendorIds)

        for (const vendor of freeVendors ?? []) {
          const count = countByVendor[vendor.id]
          const pitch = await aiText(`Write a 2-sentence upgrade pitch for "${vendor.name}", a free-tier wedding vendor on Melaa.ca who got ${count} leads this week. Encourage upgrading to Basic ($99/mo) for priority placement and verified badge. Be warm and direct.`)
          await resend.emails.send({
            from: 'Mela <hello@melaa.ca>',
            to: vendor.email,
            subject: `${count} leads this week — you're ready to upgrade 🚀`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#E8760A">You're getting traction!</h2>
              <p>${pitch}</p>
              <ul style="color:#444">
                <li>✅ Verified badge on your profile</li>
                <li>✅ Priority placement in search results</li>
                <li>✅ Featured on category pages</li>
              </ul>
              <a href="${SITE}/pricing" style="background:#E8760A;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Upgrade for $99/mo →</a>
            </div>`,
          })
          results.push(`upgrade_prompt:${vendor.name}`)
        }
      }
    }
  }

  // ─── Task 4: New vendor welcome sequence (day 1 / day 3 / day 7) ─────────
  if (hour === 10) {
    for (const daysAgo of [1, 3, 7]) {
      const start = new Date(Date.now() - (daysAgo * 24 + 1) * 60 * 60 * 1000).toISOString()
      const end = new Date(Date.now() - (daysAgo * 24 - 1) * 60 * 60 * 1000).toISOString()

      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, name, email, slug, tier')
        .gte('created_at', start)
        .lte('created_at', end)

      for (const vendor of vendors ?? []) {
        if (daysAgo === 1) {
          await resend.emails.send({
            from: 'Ishaan at Mela <hello@melaa.ca>',
            to: vendor.email,
            subject: `Welcome to Mela, ${vendor.name} 👋`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#E8760A">You're live on Melaa.ca!</h2>
              <p>Your profile is now visible to South Asian families across the GTA searching for wedding vendors.</p>
              <p><strong>3 things to do right now:</strong></p>
              <ol>
                <li>View your live profile: <a href="${SITE}/vendors/${vendor.slug}">${SITE}/vendors/${vendor.slug}</a></li>
                <li>Share it on your Instagram stories</li>
                <li>Ask past clients to send you inquiries through Mela to build your reputation</li>
              </ol>
              <a href="${SITE}/dashboard" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Go to Dashboard →</a>
            </div>`,
          })
        } else if (daysAgo === 3) {
          await resend.emails.send({
            from: 'Ishaan at Mela <hello@melaa.ca>',
            to: vendor.email,
            subject: `How's it going so far, ${vendor.name.split(' ')[0]}?`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#E8760A">Quick check-in</h2>
              <p>It's been 3 days since you joined Mela. Vendors who upgrade to Basic get a <strong>Verified badge</strong> and show up first in search results — meaning more inquiries.</p>
              <a href="${SITE}/pricing" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">See Upgrade Options →</a>
            </div>`,
          })
        } else if (daysAgo === 7) {
          await resend.emails.send({
            from: 'Ishaan at Mela <hello@melaa.ca>',
            to: vendor.email,
            subject: `1 week on Mela — here's how to get more leads`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#E8760A">You've been live for 1 week!</h2>
              <p>Top tips to get more inquiries:</p>
              <ul>
                <li>Add a portfolio description to your profile</li>
                <li>Link your Mela profile in your Instagram bio</li>
                <li>Upgrade to Basic to appear at the top of your category</li>
              </ul>
              <a href="${SITE}/dashboard" style="background:#1A1A1A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Update Profile →</a>
              <a href="${SITE}/pricing" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px;margin-left:8px">Upgrade →</a>
            </div>`,
          })
        }
        results.push(`welcome_day${daysAgo}:${vendor.name}`)
      }
    }
  }

  // ─── Task 5: Outreach follow-up — contacted but not listed after 3 days ───
  if (hour === 14) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const { data: stale } = await supabase
      .from('outreach')
      .select('*')
      .eq('status', 'contacted')
      .lte('created_at', threeDaysAgo)

    for (const lead of stale ?? []) {
      if (!lead.email && !lead.whatsapp) continue
      if (lead.email) {
        const followUp = await aiText(`Write a short 2-sentence follow-up message to ${lead.business_name}, a ${lead.category} in ${lead.city}, who was previously contacted about listing on Melaa.ca for free. Friendly nudge, no pressure.`)
        await resend.emails.send({
          from: 'Ishaan at Mela <hello@melaa.ca>',
          to: lead.email,
          subject: `Following up — free listing on Melaa.ca`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <p>${followUp}</p>
            <a href="${SITE}/list-your-business" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">List for Free →</a>
          </div>`,
        })
        results.push(`followup:${lead.business_name}`)
      }
    }
  }

  // ─── Task 6: Weekly SEO blog — generate + save to blog_drafts ────────────
  if (day === 0 && hour === 6) {
    const categories = ['photographers', 'decorators', 'catering', 'makeup-artists', 'mehndi-artists', 'djs', 'florists']
    const cities = ['brampton', 'mississauga', 'toronto', 'markham', 'vaughan', 'oakville', 'richmond-hill']
    const cat = categories[Math.floor(Math.random() * categories.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const title = `Best South Asian Wedding ${cat.replace(/-/g, ' ')} in ${city.replace(/-/g, ' ')} (2025)`

    const content = await aiText(
      `Write a 400-word SEO blog post titled "${title}". Include the keyword naturally 4-5 times. Cover: what to look for, average prices, how to find them on Melaa.ca. South Asian community tone. Use short paragraphs.`,
      600
    )

    if (content) {
      await supabase.from('blog_drafts').insert({
        title,
        slug: `${cat}-${city}-2025-${Date.now()}`,
        content,
        category: cat,
        city,
        status: 'draft',
      })
      results.push(`seo_blog:${cat}/${city}`)
    }
  }

  // ─── Task 7: Churn prevention — subscription ending in 7 days ─────────────
  if (hour === 11) {
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const now7 = new Date().toISOString()
    const { data: atRisk } = await supabase
      .from('vendors')
      .select('name, email, tier')
      .neq('tier', 'free')
      .lte('subscription_end_date', in7Days)
      .gte('subscription_end_date', now7)

    for (const vendor of atRisk ?? []) {
      await resend.emails.send({
        from: 'Ishaan at Mela <hello@melaa.ca>',
        to: vendor.email,
        subject: `Your Mela ${vendor.tier} subscription renews in 7 days`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#E8760A">Thanks for being a Mela ${vendor.tier} member!</h2>
          <p>Your subscription renews in 7 days. You'll continue getting priority placement, your verified badge, and direct inquiries from GTA families.</p>
          <p>Any questions? Just reply to this email.</p>
          <a href="${SITE}/dashboard" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Go to Dashboard →</a>
        </div>`,
      })
      results.push(`churn_prevention:${vendor.name}`)
    }
  }

  return NextResponse.json({ ok: true, tasks: results, ran_at: now.toISOString() })
}
