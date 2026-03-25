import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Confirm Your Email | Melaa' }

export default function AuthConfirmPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAF7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 24px rgba(26,26,26,0.08)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</p>
        <h1
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '1rem',
          }}
        >
          Check your email
        </h1>
        <p
          style={{
            color: '#6b6b6b',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
          }}
        >
          Check your email to confirm your account. Once confirmed, you can log in.
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#E8760A',
            color: '#FAFAF7',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
          }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
