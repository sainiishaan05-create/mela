/**
 * Mela AI Agent — runs on a schedule via Vercel Cron (every day at 9am)
 * Tasks:
 * 1. Send vendors a daily digest of unread leads
 * 2. Nudge vendors with unanswered leads older than 48h
 * 3. (Weekly) Generate an SEO blog post stub for a trending category+city combo
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

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Protect with a secret token
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== process.env.AGENT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    // Task 1: Daily lead digest — group unread leads by vendor, send summary
    const { data: unreadLeads } = await supabase
      .from('leads')
      .select('*, vendor:vendors(id, name, email, slug)')
      .eq('is_read', false)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (unreadLeads && unreadLeads.length > 0) {
      // Group by vendor
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

        // AI-generate a short motivational digest message
        let agentMessage = ''
        try {
          const ai = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 100,
            messages: [{
              role: 'user',
              content: `Write one warm, motivating sentence for a wedding vendor named ${vendor.name} who received ${leads.length} new inquiry(ies) today on Mela.`,
            }],
          })
          agentMessage = (ai.content[0] as { type: string; text: string }).text
        } catch { /* non-blocking */ }

        await resend.emails.send({
          from: 'Mela Agent <agent@melaa.ca>',
          to: vendor.email,
          subject: `You have ${leads.length} new inquiry${leads.length > 1 ? 's' : ''} today 🎉`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#E8760A">Daily Lead Digest</h2>
              ${agentMessage ? `<p style="font-style:italic;color:#666">${agentMessage}</p>` : ''}
              <p><strong>${leads.length}</strong> new inquiry${leads.length > 1 ? 's' : ''} in the last 24 hours:</p>
              ${leads.map((l: { buyer_name: string; event_type: string | null; buyer_email: string }) => `<p>• <strong>${l.buyer_name}</strong> — ${l.event_type ?? 'Wedding'}</p>`).join('')}
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">View in Dashboard →</a>
            </div>
          `,
        })
        results.push(`digest:${vendor.name}`)
      }
    }

    // Task 2: 48h nudge — remind vendors of leads they haven't replied to
    const { data: oldLeads } = await supabase
      .from('leads')
      .select('*, vendor:vendors(id, name, email, slug)')
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
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#E8760A">Don't lose these leads!</h2>
              <p>You have <strong>${vendorLeads.length}</strong> unanswered inquiry${vendorLeads.length > 1 ? 's' : ''} from over 48 hours ago. Buyers who don't hear back often go with another vendor.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background:#E8760A;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:12px">Reply Now →</a>
            </div>
          `,
        })
        results.push(`nudge:${vendor.name}`)
      }
    }

    // Task 3: Weekly SEO — generate a blog post stub (runs on Sundays)
    if (new Date().getDay() === 0) {
      const categories = ['photographers', 'decorators', 'catering', 'makeup-artists', 'mehndi-artists']
      const cities = ['brampton', 'mississauga', 'toronto', 'markham', 'vaughan']
      const cat = categories[Math.floor(Math.random() * categories.length)]
      const city = cities[Math.floor(Math.random() * cities.length)]

      try {
        const ai = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Write a short SEO blog post intro (2 paragraphs) for the topic: "Best South Asian Wedding ${cat} in ${city}". Include the keyword naturally. Warm, helpful tone.`,
          }],
        })
        const content = (ai.content[0] as { type: string; text: string }).text
        // Store in Supabase for review (blog table would go here)
        results.push(`seo_draft:${cat}/${city}:${content.slice(0, 50)}...`)
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({ ok: true, tasks: results })
  } catch (err) {
    console.error('Agent error:', err)
    return NextResponse.json({ error: 'Agent failed' }, { status: 500 })
  }
}
