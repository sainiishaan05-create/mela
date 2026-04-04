import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Melaa - South Asian Wedding Vendors GTA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          South Asian Wedding Vendors
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', marginBottom: 48 }}>
          Greater Toronto Area
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '48px' }}>
          {[
            { val: '1,200+', label: 'Vendors' },
            { val: '55+', label: 'Cities' },
            { val: '33+', label: 'Categories' },
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
