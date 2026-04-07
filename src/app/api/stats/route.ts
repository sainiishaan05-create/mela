import { NextResponse } from 'next/server'
import { getSiteStats } from '@/lib/stats'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getSiteStats()
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
