import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Under Maintenance | Melaa',
  description: 'Melaa is currently under maintenance. We will be back shortly.',
}

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07050a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(200,169,106,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,169,106,0.08) 0%, transparent 70%)',
        }} />

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Logo */}
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold text-white mb-2">
          Melaa
        </h1>
        <div className="w-12 h-0.5 mx-auto mb-8 rounded-full" style={{ background: '#C8A96A' }} />

        {/* Icon */}
        <div className="text-6xl mb-6">✨</div>

        {/* Message */}
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-white mb-4">
          We&apos;re making things even better
        </h2>
        <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Melaa is currently under maintenance as we roll out some exciting updates.
          We&apos;ll be back shortly with a fresh experience.
        </p>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
          style={{
            background: 'rgba(200,169,106,0.08)',
            border: '1px solid rgba(200,169,106,0.2)',
          }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#C8A96A' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#C8A96A' }} />
          </span>
          <span className="text-sm font-medium" style={{ color: '#C8A96A' }}>
            Maintenance in progress
          </span>
        </div>

        {/* Contact */}
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Questions? Reach us at{' '}
          <a href="mailto:hello@melaa.ca" className="font-medium hover:underline" style={{ color: '#C8A96A' }}>
            hello@melaa.ca
          </a>
        </p>
      </div>
    </div>
  )
}
