import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const dynamic = 'force-dynamic'

interface GenerateRequest {
  businessName: string
  category: string
  city: string
  platform: 'instagram' | 'whatsapp' | 'email'
}

export async function POST(req: Request) {
  let body: GenerateRequest

  try {
    body = (await req.json()) as GenerateRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { businessName, category, city, platform } = body

  if (!businessName || !category || !city || !platform) {
    return NextResponse.json(
      { error: 'Missing required fields: businessName, category, city, platform' },
      { status: 400 }
    )
  }

  if (!['instagram', 'whatsapp', 'email'].includes(platform)) {
    return NextResponse.json(
      { error: 'platform must be one of: instagram, whatsapp, email' },
      { status: 400 }
    )
  }

  try {
    const ai = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `Write a short ${platform} outreach message to ${businessName}, a South Asian wedding ${category} in ${city}, inviting them to list on Melaa (melaa.ca) for free. Warm, direct, South Asian community tone. Under 80 words. No hashtags.`,
        },
      ],
    })

    const message = (ai.content[0] as { type: string; text: string }).text

    return NextResponse.json({ message })
  } catch (err) {
    console.error('Claude generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate message' },
      { status: 500 }
    )
  }
}
