import type { Metadata } from 'next'
import VendorSignupForm from '@/components/vendors/VendorSignupForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'List Your Business | Mela',
  description: 'Join Mela free and get discovered by thousands of South Asian families planning their weddings in the GTA.',
}

export default async function ListYourBusinessPage() {
  const supabase = await createClient()
  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">
          List Your Business on Mela
        </h1>
        <p className="text-gray-500 text-lg">Get discovered by thousands of South Asian families planning weddings in the GTA. <strong className="text-[#E8760A]">Free during our founding period.</strong></p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[['🆓', 'Free to list', 'No credit card needed'], ['📩', 'Get real leads', 'Direct buyer inquiries'], ['🚀', 'Go live instantly', 'Your profile is live same day']].map(([icon, title, desc]) => (
          <div key={title} className="text-center p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <VendorSignupForm categories={categories ?? []} cities={cities ?? []} />
      </div>
    </div>
  )
}
