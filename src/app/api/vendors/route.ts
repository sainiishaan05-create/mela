import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import slugify from 'slugify'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, category_id, city_id, description, website, instagram } = body

    if (!name || !email || !category_id || !city_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existing } = await supabase.from('vendors').select('id').eq('email', email).single()
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true })
    const { data: slugExists } = await supabase.from('vendors').select('id').eq('slug', slug).single()
    if (slugExists) slug = `${slug}-${Date.now()}`

    // AI-enhance the description if it's short or missing
    let finalDescription = description
    if (!description || description.length < 50) {
      try {
        const { data: cat } = await supabase.from('categories').select('name').eq('id', category_id).single()
        const { data: city } = await supabase.from('cities').select('name').eq('id', city_id).single()
        const aiRes = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `Write a warm, professional 2-sentence business description for a South Asian wedding ${cat?.name} called "${name}" based in ${city?.name}, GTA. Make it inviting and culturally authentic.`,
          }],
        })
        finalDescription = (aiRes.content[0] as { type: string; text: string }).text
      } catch {
        // AI enhancement optional
      }
    }

    // Create vendor
    const { error } = await supabase.from('vendors').insert({
      slug, name, email,
      phone: phone || null,
      category_id, city_id,
      description: finalDescription || null,
      website: website || null,
      instagram: instagram || null,
    })

    if (error) throw error

    // Welcome email to vendor
    await resend.emails.send({
      from: 'Mela <hello@mela.ca>',
      to: email,
      subject: `Welcome to Mela, ${name}! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E8760A;">Welcome to Mela! 🎉</h2>
          <p>Hi there,</p>
          <p><strong>${name}</strong> is now live on Mela. South Asian families across the GTA can now discover you!</p>
          <p>Your profile is at: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/vendors/${slug}">${process.env.NEXT_PUBLIC_SITE_URL}/vendors/${slug}</a></p>
          <h3>What happens next?</h3>
          <ul>
            <li>Buyers will find you through search and category pages</li>
            <li>When someone sends an inquiry, you'll get an email with their details</li>
            <li>We'll even include an AI-drafted reply to help you respond quickly</li>
          </ul>
          <p>Questions? Just reply to this email.</p>
          <p>— The Mela Team</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, slug })
  } catch (err) {
    console.error('Vendor signup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
