import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NewsletterTab from '@/components/ui/NewsletterTab'
import { QuoteSelectionProvider } from '@/components/quotes/QuoteSelectionProvider'
import FloatingQuoteBar from '@/components/quotes/FloatingQuoteBar'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Melaa | South Asian Wedding & Event Vendors in GTA',
  description: 'Find the best South Asian wedding photographers, decorators, caterers, DJs and more in the Greater Toronto Area.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Melaa | South Asian Wedding & Event Vendors in GTA',
    description: 'Find the best South Asian wedding photographers, decorators, caterers, DJs and more in the Greater Toronto Area.',
    url: 'https://melaa.ca',
    siteName: 'Melaa',
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Melaa - South Asian Wedding & Event Vendors GTA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melaa | South Asian Wedding & Event Vendors in GTA',
    description: 'Find the best South Asian wedding photographers, decorators, caterers, DJs and more in the Greater Toronto Area.',
    images: ['/og-image.png'],
  },
  other: {
    'instagram:account': 'melaa.ca_',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7DQS2RPKVN"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7DQS2RPKVN');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#1A1A1A] font-[family-name:var(--font-inter)]">
        <QuoteSelectionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingQuoteBar />
          <NewsletterTab />
        </QuoteSelectionProvider>
      </body>
    </html>
  )
}
