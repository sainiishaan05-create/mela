import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Melaa',
  description: 'Terms of Service for Melaa, the South Asian wedding and event vendor directory for the Greater Toronto Area.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      {/* Hero — Rangoli Mandala identity */}
      <section className="bg-luxury-dark hero-rangoli relative py-16 px-4 sm:px-6">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="section-label mb-5 justify-center">Legal</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Last updated: April 2026</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="legal-gutter prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Melaa ("we", "our", "us") at melaa.ca, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Melaa is an online directory that connects clients planning South Asian weddings in the Greater Toronto Area with local wedding vendors. We offer free and paid listing tiers for vendors, and free browsing for clients.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>3. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              Vendors may create accounts to manage their listings. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>4. Vendor Listings</h2>
            <p className="text-gray-600 leading-relaxed">
              Vendors are responsible for the accuracy of their listing information. Melaa reserves the right to remove or modify any listing that violates these terms, contains inaccurate information, or is otherwise inappropriate. We do not guarantee leads, inquiries, or bookings to any vendor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>5. Payments and Subscriptions</h2>
            <p className="text-gray-600 leading-relaxed">
              Paid plans are billed monthly via Stripe. You may cancel your subscription at any time. Cancellations take effect at the end of your current billing period. We do not offer refunds for partial months. Pricing is subject to change with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>6. Content</h2>
            <p className="text-gray-600 leading-relaxed">
              By submitting content (photos, descriptions, contact information) to Melaa, you grant us a non-exclusive, royalty-free licence to display that content on our platform and in our marketing materials. You represent that you own or have rights to all content you submit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>7. Prohibited Uses</h2>
            <p className="text-gray-600 leading-relaxed">
              You may not use Melaa to post false or misleading information, spam other users, scrape or harvest data from our platform, interfere with our services, or engage in any unlawful activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>8. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">
              Melaa is provided "as is" without warranties of any kind. We do not endorse, verify, or guarantee any vendor listed on our platform. Clients should conduct their own due diligence before booking any vendor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>9. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              To the fullest extent permitted by law, Melaa shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our platform or any vendor services found through our platform.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3">
              Melaa is a directory and listing service only. We do not participate in, mediate, or assume any responsibility for transactions, agreements, disputes, or interactions between clients and vendors. Any arrangement made between a client and a vendor, including pricing, service delivery, quality, cancellations, refunds, or any other matter, is solely between those parties.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Melaa does not endorse, guarantee, or warrant any vendor listed on the platform. We are not responsible for any loss, damage, injury, or dispute arising from services provided by any vendor, whether or not that vendor was discovered through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>10. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms from time to time. We will notify users of material changes by updating the date at the top of this page. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>11. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>12. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, contact us at{' '}
              <a href="mailto:hello@melaa.ca" className="text-rose-600 hover:underline">hello@melaa.ca</a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/privacy" className="text-rose-600 hover:underline text-sm">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  )
}
