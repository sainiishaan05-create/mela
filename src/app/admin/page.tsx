// Add ADMIN_EMAIL=your@email.com to .env.local

import { createClient } from '@/lib/supabase/server'
import type { Vendor, Category, City } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VendorRow extends Omit<Vendor, 'category' | 'city'> {
  category: Category | null
  city: City | null
}

interface Stats {
  totalVendors: number
  totalLeads: number
  unreadLeads: number
  byTier: { free: number; basic: number; premium: number }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#E5E5E0] bg-white px-6 py-5 shadow-sm">
      <p className="text-sm font-medium text-[#6B6B6B] uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-[#1A1A1A]">{value}</p>
    </div>
  )
}

// ─── Action Button ────────────────────────────────────────────────────────────

function ActionButton({
  vendorId,
  action,
  label,
  variant,
}: {
  vendorId: string
  action: 'verify' | 'feature' | 'deactivate'
  label: string
  variant: 'primary' | 'secondary' | 'danger'
}) {
  const base =
    'inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1'
  const styles: Record<string, string> = {
    primary:
      'bg-[#E8760A] text-white hover:bg-[#cf6809] focus:ring-[#E8760A]',
    secondary:
      'bg-[#F3F3EF] text-[#1A1A1A] hover:bg-[#E5E5E0] focus:ring-[#1A1A1A]',
    danger:
      'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500',
  }

  return (
    <form
      action={async () => {
        'use server'
        // Server action — proxies to the API route logic directly
        const { createClient: makeClient } = await import(
          '@/lib/supabase/server'
        )
        const supabase = await makeClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user || user.email !== process.env.ADMIN_EMAIL) return

        const updates: Record<string, boolean> = {}
        if (action === 'verify') updates.is_verified = true
        if (action === 'feature') updates.is_featured = true
        if (action === 'deactivate') updates.is_active = false

        await supabase.from('vendors').update(updates).eq('id', vendorId)
      }}
    >
      <button type="submit" className={`${base} ${styles[variant]}`}>
        {label}
      </button>
    </form>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({
  value,
  trueLabel = 'Yes',
  falseLabel = 'No',
}: {
  value: boolean
  trueLabel?: string
  falseLabel?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        value
          ? 'bg-green-100 text-green-700'
          : 'bg-[#F3F3EF] text-[#6B6B6B]'
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  )
}

function TierBadge({ tier }: { tier: Vendor['tier'] }) {
  const styles: Record<Vendor['tier'], string> = {
    free: 'bg-[#F3F3EF] text-[#6B6B6B]',
    basic: 'bg-blue-50 text-blue-700',
    premium: 'bg-amber-50 text-amber-700',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${styles[tier]}`}
    >
      {tier}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-10 py-8 text-center">
          <p className="text-lg font-semibold text-red-700">Unauthorized</p>
          <p className="mt-1 text-sm text-red-500">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    )
  }

  // Fetch vendors with joins
  const { data: vendorsRaw } = await supabase
    .from('vendors')
    .select('*, category:categories(*), city:cities(*)')
    .order('created_at', { ascending: false })

  const vendors = (vendorsRaw ?? []) as VendorRow[]

  // Fetch leads counts
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  const { count: unreadLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  const stats: Stats = {
    totalVendors: vendors.length,
    totalLeads: totalLeads ?? 0,
    unreadLeads: unreadLeads ?? 0,
    byTier: {
      free: vendors.filter((v) => v.tier === 'free').length,
      basic: vendors.filter((v) => v.tier === 'basic').length,
      premium: vendors.filter((v) => v.tier === 'premium').length,
    },
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div
          className="h-8 w-1 rounded-full"
          style={{ background: '#E8760A' }}
        />
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A]">
          Admin Dashboard
        </h1>
      </div>

      {/* Stats Row */}
      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Vendors" value={stats.totalVendors} />
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="Unread Leads" value={stats.unreadLeads} />
        <StatCard label="Free" value={stats.byTier.free} />
        <StatCard label="Basic" value={stats.byTier.basic} />
        <StatCard label="Premium" value={stats.byTier.premium} />
      </section>

      {/* Vendors Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">
          All Vendors
          <span className="ml-2 text-sm font-normal text-[#6B6B6B]">
            ({vendors.length})
          </span>
        </h2>

        <div className="overflow-x-auto rounded-xl border border-[#E5E5E0] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#E5E5E0] text-sm">
            <thead className="bg-[#FAFAF7]">
              <tr>
                {[
                  'Name',
                  'Category',
                  'City',
                  'Tier',
                  'Verified',
                  'Featured',
                  'Active',
                  'Actions',
                ].map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {vendors.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-[#6B6B6B]"
                  >
                    No vendors found.
                  </td>
                </tr>
              )}
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="transition-colors hover:bg-[#FAFAF7]"
                >
                  {/* Name */}
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#1A1A1A]">
                    <div>{vendor.name}</div>
                    <div className="text-xs text-[#6B6B6B]">{vendor.email}</div>
                  </td>

                  {/* Category */}
                  <td className="whitespace-nowrap px-4 py-3 text-[#1A1A1A]">
                    {vendor.category?.name ?? (
                      <span className="text-[#6B6B6B]">—</span>
                    )}
                  </td>

                  {/* City */}
                  <td className="whitespace-nowrap px-4 py-3 text-[#1A1A1A]">
                    {vendor.city?.name ?? (
                      <span className="text-[#6B6B6B]">—</span>
                    )}
                  </td>

                  {/* Tier */}
                  <td className="whitespace-nowrap px-4 py-3">
                    <TierBadge tier={vendor.tier} />
                  </td>

                  {/* Verified */}
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge value={vendor.is_verified} />
                  </td>

                  {/* Featured */}
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge value={vendor.is_featured} />
                  </td>

                  {/* Active */}
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge value={vendor.is_active} trueLabel="Active" falseLabel="Inactive" />
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!vendor.is_verified && (
                        <ActionButton
                          vendorId={vendor.id}
                          action="verify"
                          label="Verify"
                          variant="primary"
                        />
                      )}
                      {!vendor.is_featured && (
                        <ActionButton
                          vendorId={vendor.id}
                          action="feature"
                          label="Feature"
                          variant="secondary"
                        />
                      )}
                      {vendor.is_active && (
                        <ActionButton
                          vendorId={vendor.id}
                          action="deactivate"
                          label="Deactivate"
                          variant="danger"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
