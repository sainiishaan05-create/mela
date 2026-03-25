import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Melaa — South Asian Wedding Vendors in GTA',
  description: 'Find the best South Asian wedding photographers, decorators, caterers, DJs and more in the Greater Toronto Area.',
  openGraph: {
    title: 'Melaa — South Asian Wedding Vendors in GTA',
    description: 'Find the best South Asian wedding photographers, decorators, caterers, DJs and more in the Greater Toronto Area.',
    url: 'https://melaa.ca',
    siteName: 'Melaa',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melaa — South Asian Wedding Vendors in GTA',
    description: 'Find the best South Asian wedding photographers, decorators, caterers, DJs and more in the Greater Toronto Area.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#1A1A1A] font-[family-name:var(--font-inter)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
