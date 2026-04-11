import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Melaa - South Asian Wedding & Event Vendors GTA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Fetch live counts via Supabase REST (edge-compatible, no SDK needed)
async function fetchCounts() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return { vendors: 0, categories: 0, cities: 0 }
    const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' }
    const [v, c, t] = await Promise.all([
      fetch(`${url}/rest/v1/vendors?is_active=eq.true&select=id`, { headers }),
      fetch(`${url}/rest/v1/categories?select=id`, { headers }),
      fetch(`${url}/rest/v1/cities?select=id`, { headers }),
    ])
    const parseCount = (res: Response) => {
      const range = res.headers.get('content-range') || '0/0'
      return parseInt(range.split('/')[1] || '0', 10)
    }
    return { vendors: parseCount(v), categories: parseCount(c), cities: parseCount(t) }
  } catch {
    return { vendors: 0, categories: 0, cities: 0 }
  }
}

export default async function Image() {
  const { vendors, categories, cities } = await fetchCounts()
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#07050a',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Gold glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '25%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,169,106,0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Logo */}
        <div style={{ fontSize: 72, fontWeight: 900, color: '#C8A96A', marginBottom: 12, fontFamily: 'serif' }}>
          Melaa
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          South Asian Wedding & Event Vendors
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', marginBottom: 48 }}>
          Greater Toronto Area
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '48px' }}>
          {[
            { val: `${vendors.toLocaleString()}+`, label: 'Vendors' },
            { val: `${cities}+`, label: 'Cities' },
            { val: `${categories}+`, label: 'Categories' },
            { val: '$0', label: 'Booking Fees' },
          ].map(({ val, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#C8A96A' }}>{val}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #C8A96A, #d4a843, #C8A96A)',
          }}
        />

        {/* URL */}
        <div style={{ position: 'absolute', bottom: 24, right: 80, fontSize: 16, color: 'rgba(200,169,106,0.6)', fontWeight: 600 }}>
          melaa.ca
        </div>
      </div>
    ),
    { ...size }
  )
}
