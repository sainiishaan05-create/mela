/**
 * GROWTH AGENT
 * Role: SEO, partnerships, referrals, platform virality
 * Schedule: Every Wednesday 7am UTC
 *
 * Tasks:
 * 1. Generate 5 new SEO landing page stubs for top category+city combos with no existing page
 * 2. Identify partnership targets (South Asian wedding planners, venues, blogs) + write outreach email
 * 3. Generate referral program copy — personalized per vendor with their referral link
 * 4. Create Google Business Profile post copy for the week
 * 5. Backlink outreach — generate pitch emails for relevant wedding directories and blogs
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

async function ai(prompt: string, tokens = 400): Promise<string> {
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
  if (!process.env.AGENT_SECRET || searchParams.get('token') !== process.env.AGENT_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  const now = new Date()

  // ── Task 1: Generate 5 SEO page stubs for high-demand combos ─────────────
  const { data: categories } = await supabase.from('categories').select('slug, name')
  const { data: cities } = await supabase.from('cities').select('slug, name')

  // Get combos that have leads but few vendors
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('vendor:vendors(category:categories(slug,name), city:cities(slug,name))')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const demandMap: Record<string, { cat: string; city: string; catSlug: string; citySlug: string; count: number }> = {}
  for (const lead of recentLeads ?? []) {
    const v = lead.vendor as { category?: { slug: string; name: string }; city?: { slug: string; name: string } }
    if (v?.category && v?.city) {
      const key = `${v.category.slug}:${v.city.slug}`
      if (!demandMap[key]) demandMap[key] = { cat: v.category.name, city: v.city.name, catSlug: v.category.slug, citySlug: v.city.slug, count: 0 }
      demandMap[key].count++
    }
  }

  const topCombos = Object.values(demandMap).sort((a, b) => b.count - a.count).slice(0, 5)

  const seoPages = await Promise.all(
    topCombos.map(combo =>
      ai(`Write a 300-word SEO page intro for "${combo.cat} in ${combo.city}" on Melaa.ca, a South Asian wedding vendor directory.
      Target keyword: "South Asian wedding ${combo.cat.toLowerCase()} in ${combo.city}".
      Include: what to look for, why Melaa.ca, average price range hint, CTA.
      H1: Best South Asian Wedding ${combo.cat} in ${combo.city} | Melaa.ca`, 400)
    )
  )

  if (topCombos.length > 0) {
    await supabase.from('content_queue').insert(
      seoPages.map((content, i) => ({
        type: 'seo_page',
        content,
        topic: `${topCombos[i].cat} in ${topCombos[i].city}`,
        meta: JSON.stringify({ catSlug: topCombos[i].catSlug, citySlug: topCombos[i].citySlug }),
        status: 'ready',
        scheduled_for: new Date().toISOString(),
      }))
    )
    results.push(`seo_pages:${topCombos.length}_generated`)
  }

  // ── Task 2: Partnership outreach kit ─────────────────────────────────────
  if (ADMIN_EMAIL) {
    const partnerTypes = [
      { type: 'South Asian wedding planner', location: 'Brampton' },
      { type: 'South Asian wedding venue', location: 'Mississauga' },
      { type: 'South Asian wedding blog or magazine', location: 'Toronto' },
      { type: 'South Asian community center', location: 'GTA' },
    ]

    const pitches = await Promise.all(
      partnerTypes.map(p =>
        ai(`Write a cold outreach email to a ${p.type} in ${p.location} proposing a partnership with Melaa.ca — the leading South Asian wedding vendor directory in GTA.
        Partnership idea: refer your clients to Melaa and vice versa. We list them as a featured partner. No cost.
        Sign as "Ishaan, Founder of Melaa.ca". 150 words max.`)
      )
    )

    const partnerHtml = pitches.map((pitch, i) =>
      `<div style="margin-bottom:24px;padding:16px;background:#fafaf7;border-radius:8px;border-left:3px solid #C8A96A">
        <p style="margin:0 0 8px;font-weight:bold;color:#1A1A1A">${partnerTypes[i].type} — ${partnerTypes[i].location}</p>
        <p style="margin:0;white-space:pre-wrap;font-size:13px;color:#333">${pitch}</p>
      </div>`
    ).join('')

    // Referral emails to vendors are disabled — no marketing emails to vendors
    results.push('referral_emails:disabled')

    await resend.emails.send({
      from: 'Melaa Growth <agent@melaa.ca>',
      to: ADMIN_EMAIL,
      subject: `🤝 Partnership Outreach Kit — 4 ready-to-send pitches`,
      html: `<div style="font-family:sans-serif;max-width:650px;margin:0 auto">
        <h2 style="color:#C8A96A">Partnership Outreach Kit</h2>
        <p>4 partnership pitch emails ready to send. Find these businesses on Google/Instagram and send.</p>
        ${partnerHtml}
        <p style="color:#999;font-size:12px;margin-top:24px">Generated by Melaa Growth Agent · ${now.toDateString()}</p>
      </div>`,
    })
    results.push('partnership_kit:4_pitches')
  }

  // ── Task 3: Google Business Profile post copy ─────────────────────────────
  if (ADMIN_EMAIL) {
    const gbpPost = await ai(`Write a Google Business Profile post for Melaa.ca (South Asian wedding vendor directory in GTA).
    150 words max. Include: what Melaa is, current season relevance, CTA with the URL melaa.ca.
    Friendly, local, trustworthy tone. No hashtags.`)

    await supabase.from('content_queue').insert({
      type: 'google_business_post',
      content: gbpPost,
      topic: 'GBP weekly post',
      status: 'ready',
      scheduled_for: new Date().toISOString(),
    })
    results.push('gbp_post:generated')
  }

  return NextResponse.json({ ok: true, agent: 'growth', tasks: results, ran_at: now.toISOString() })
}
