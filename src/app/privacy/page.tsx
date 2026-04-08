import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Mela',
  description: 'Privacy Policy for Melaa, the South Asian wedding and event vendor directory for the Greater Toronto Area.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero — Jali Lattice identity */}
      <section className="bg-luxury-dark hero-jali-frame relative py-16 px-4 sm:px-6">
        <div className="legal-watermark hidden md:block">§</div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="section-label mb-5 justify-center">Legal</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Last updated: March 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="legal-gutter prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Mela ("we", "our", "us") operates melaa.ca. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform. By using Mela, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Account information:</strong> Name, email address, and password when you create a vendor account.</li>
              <li><strong>Vendor listing information:</strong> Business name, phone number, address, website, Instagram handle, and photos you provide.</li>
              <li><strong>Inquiry information:</strong> Name, email, phone, and message when clients submit inquiries through vendor profiles.</li>
              <li><strong>Payment information:</strong> Billing details processed securely by Stripe. We do not store payment card details.</li>
              <li><strong>Usage data:</strong> Pages visited, time spent, browser type, IP address, and referral source via analytics tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>To provide and maintain our directory service</li>
              <li>To forward client inquiries to the relevant vendor</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send transactional emails (account confirmation, inquiry notifications)</li>
              <li>To improve our platform through analytics</li>
              <li>To contact you about your account or our services</li>
              <li>To publish vendor spotlight content on our social media channels (with your content)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>4. Social Media</h2>
            <p className="text-gray-600 leading-relaxed">
              Mela maintains business accounts on Instagram and TikTok. We use the TikTok Content Posting API and Instagram Graph API to publish content to our own business accounts. We do not access, store, or post to any user's personal social media accounts. We only post to our own @melaa.ca accounts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>5. Sharing Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We do not sell your personal information. We share information only with:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Vendors:</strong> When a client submits an inquiry, we share the client's contact details with the relevant vendor.</li>
              <li><strong>Service providers:</strong> Supabase (database), Stripe (payments), Resend (email), Vercel (hosting), Google Analytics (analytics). These providers process data only as necessary to provide their services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>6. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies for authentication (keeping you logged in), preferences, and analytics. You can disable cookies in your browser settings, though this may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your account data for as long as your account is active. Vendor listings are retained until you request deletion. You may request deletion of your account and associated data by emailing hello@melaa.ca.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>8. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Under applicable Canadian privacy law (PIPEDA), you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for non-essential data processing</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise these rights, contact us at <a href="mailto:hello@melaa.ca" className="text-rose-600 hover:underline">hello@melaa.ca</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>9. Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures including encrypted connections (HTTPS), secure authentication via Supabase, and encrypted payment processing via Stripe. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>10. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Mela is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Continued use of Mela after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>12. Third-Party Transactions</h2>
            <p className="text-gray-600 leading-relaxed">
              Mela is a directory service that connects clients with vendors. We do not participate in, mediate, or bear any responsibility for transactions, agreements, disputes, or interactions between clients and vendors. Any arrangement between a client and a vendor is solely between those parties. Mela does not endorse, guarantee, or warrant any vendor or their services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 font-[family-name:var(--font-playfair)]" style={{ color: 'var(--color-gold-dark)' }}>13. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related questions or requests, contact:{' '}
              <a href="mailto:hello@melaa.ca" className="text-rose-600 hover:underline">hello@melaa.ca</a>
              <br />
              Mela, Toronto, Ontario, Canada
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/terms" className="text-rose-600 hover:underline text-sm">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  )
}
