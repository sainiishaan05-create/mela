/**
 * Team Wealth Dashboard
 * Shows: cap table, implied equity value at current MRR valuation,
 * revenue milestones, and what each person earns at exit.
 */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const VALUATION_MULTIPLE = 8 // SaaS marketplaces: 6-12x ARR. Conservative = 8x.
const BASIC_PRICE = 99
const PREMIUM_PRICE = 249

function currency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-10 py-8 text-center">
          <p className="text-lg font-semibold text-red-700">Unauthorized</p>
        </div>
      </div>
    )
  }

  // Pull live business metrics
  const [
    { count: basicCount },
    { count: premiumCount },
    { count: totalVendors },
    { count: totalLeads },
    { count: newVendorsThisMonth },
    { data: teamMembers },
    { data: milestones },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'basic'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('team').select('*').order('equity_pct', { ascending: false }),
    supabase.from('milestones').select('*').order('mrr_target', { ascending: true }),
  ])

  // Core financials
  const mrr = ((basicCount ?? 0) * BASIC_PRICE) + ((premiumCount ?? 0) * PREMIUM_PRICE)
  const arr = mrr * 12
  const impliedValuation = arr * VALUATION_MULTIPLE
  const monthlyGrowthRate = totalVendors && totalVendors > 0
    ? ((newVendorsThisMonth ?? 0) / totalVendors) * 100 : 0

  // 12-month projection (assumes current monthly growth rate compounds)
  const projectedMRR12 = Math.round(mrr * Math.pow(1 + monthlyGrowthRate / 100, 12))
  const projectedValuation12 = projectedMRR12 * 12 * VALUATION_MULTIPLE

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-[#E8760A]" />
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A]">
          Team Wealth Dashboard
        </h1>
      </div>
      <p className="mb-8 ml-4 text-sm text-[#6B6B6B]">
        Every decision we make should build toward this. This is why we work.
      </p>

      {/* Core Valuation Block */}
      <section className="mb-8 rounded-2xl bg-[#1A1A1A] p-8 text-white">
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-[#E8760A]">
          Implied Company Valuation
        </p>
        <p className="mb-1 font-[family-name:var(--font-playfair)] text-5xl font-bold">
          {currency(impliedValuation)}
        </p>
        <p className="text-sm text-gray-400">
          Based on {currency(mrr)} MRR × 12 = {currency(arr)} ARR × {VALUATION_MULTIPLE}x multiple
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'MRR', value: currency(mrr), sub: 'monthly recurring' },
            { label: 'ARR', value: currency(arr), sub: 'annual recurring' },
            { label: 'Total Vendors', value: (totalVendors ?? 0).toString(), sub: 'active listings' },
            { label: 'Total Leads', value: (totalLeads ?? 0).toString(), sub: 'buyer inquiries' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 12-Month Projection */}
      <section className="mb-8 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">12-Month Projection</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-[#FAFAF7] p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">Projected MRR</p>
            <p className="mt-1 text-2xl font-bold text-[#E8760A]">{currency(projectedMRR12)}</p>
            <p className="text-xs text-[#6B6B6B]">at current {monthlyGrowthRate.toFixed(1)}%/mo growth</p>
          </div>
          <div className="rounded-xl bg-[#FAFAF7] p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">Projected ARR</p>
            <p className="mt-1 text-2xl font-bold text-[#1A1A1A]">{currency(projectedMRR12 * 12)}</p>
            <p className="text-xs text-[#6B6B6B]">annualized</p>
          </div>
          <div className="rounded-xl bg-[#FAFAF7] p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">Projected Valuation</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{currency(projectedValuation12)}</p>
            <p className="text-xs text-[#6B6B6B]">at {VALUATION_MULTIPLE}x ARR</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-[#6B6B6B]">
          * Projection assumes current monthly vendor growth rate compounds. Conservative {VALUATION_MULTIPLE}x ARR multiple (YC-stage SaaS marketplaces typically trade at 8–15x).
        </p>
      </section>

      {/* Cap Table */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Cap Table</h2>
          <p className="text-xs text-[#6B6B6B]">Equity value = your % × current implied valuation</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[#E5E5E0] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#E5E5E0] text-sm">
            <thead className="bg-[#FAFAF7]">
              <tr>
                {['Name', 'Role', 'Equity %', 'Value Today', 'Value (12mo proj)', 'Vesting', 'Status'].map(col => (
                  <th key={col} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {(teamMembers ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6B6B6B]">
                    No team members added yet. Run the SQL below to add your team.
                  </td>
                </tr>
              )}
              {(teamMembers ?? []).map((member: {
                id: string; name: string; role: string; equity_pct: number;
                vesting_months: number; cliff_months: number; start_date: string; is_active: boolean
              }) => {
                const equityValue = Math.round((member.equity_pct / 100) * impliedValuation)
                const equityValue12 = Math.round((member.equity_pct / 100) * projectedValuation12)
                const monthsIn = Math.floor((Date.now() - new Date(member.start_date).getTime()) / (30 * 24 * 60 * 60 * 1000))
                const vestedPct = monthsIn < member.cliff_months ? 0 : Math.min(100, Math.round((monthsIn / member.vesting_months) * 100))
                const vestedValue = Math.round(equityValue * vestedPct / 100)

                return (
                  <tr key={member.id} className="hover:bg-[#FAFAF7]">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-[#1A1A1A]">{member.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#6B6B6B]">{member.role}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-bold text-[#E8760A]">{member.equity_pct}%</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-semibold text-[#1A1A1A]">{currency(equityValue)}</div>
                      <div className="text-xs text-green-600">{currency(vestedValue)} vested ({vestedPct}%)</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-green-600">
                      {currency(equityValue12)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[#6B6B6B]">
                      {member.vesting_months}mo / {member.cliff_months}mo cliff
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-[#F3F3EF] text-[#6B6B6B]'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Revenue Milestones → What they mean for the team */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">
          Revenue Milestones
          <span className="ml-2 text-sm font-normal text-[#6B6B6B]">— what each one means for everyone</span>
        </h2>
        <div className="space-y-3">
          {(milestones ?? defaultMilestones).map((m: { mrr_target: number; label: string; description: string }) => {
            const mValuation = m.mrr_target * 12 * VALUATION_MULTIPLE
            const reached = mrr >= m.mrr_target
            return (
              <div key={m.mrr_target} className={`rounded-xl border p-5 ${reached ? 'border-green-200 bg-green-50' : 'border-[#E5E5E0] bg-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reached ? '✅' : '🎯'}</span>
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">{m.label}</p>
                      <p className="text-sm text-[#6B6B6B]">{m.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#6B6B6B]">Implied valuation</p>
                    <p className="text-xl font-bold text-[#E8760A]">{currency(mValuation)}</p>
                    <p className="text-xs text-[#6B6B6B]">at {VALUATION_MULTIPLE}x ARR</p>
                  </div>
                </div>
                {/* What each team member gets */}
                {(teamMembers ?? []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(teamMembers ?? []).map((member: { id: string; name: string; equity_pct: number }) => (
                      <span key={member.id} className="rounded-full bg-white border border-[#E5E5E0] px-3 py-1 text-xs">
                        <span className="font-medium">{member.name.split(' ')[0]}</span>
                        <span className="text-[#6B6B6B]"> → </span>
                        <span className="font-bold text-green-600">
                          {currency(Math.round((member.equity_pct / 100) * mValuation))}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* What we need to hit next milestone */}
      <section className="mb-8 rounded-2xl border border-[#E8760A] bg-orange-50 p-6">
        <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">Focus: What moves the valuation</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              action: 'Convert 1 free → Basic',
              impact: `+${currency(BASIC_PRICE * 12 * VALUATION_MULTIPLE)} valuation`,
              note: `$${BASIC_PRICE}/mo × 12 × ${VALUATION_MULTIPLE}x`,
            },
            {
              action: 'Convert 1 free → Premium',
              impact: `+${currency(PREMIUM_PRICE * 12 * VALUATION_MULTIPLE)} valuation`,
              note: `$${PREMIUM_PRICE}/mo × 12 × ${VALUATION_MULTIPLE}x`,
            },
            {
              action: 'Prevent 1 churn',
              impact: `Saves ${currency(BASIC_PRICE * 12 * VALUATION_MULTIPLE)}`,
              note: 'Retention = same as acquisition',
            },
          ].map(item => (
            <div key={item.action} className="rounded-xl bg-white p-4 border border-[#E5E5E0]">
              <p className="font-semibold text-[#1A1A1A]">{item.action}</p>
              <p className="mt-1 text-lg font-bold text-[#E8760A]">{item.impact}</p>
              <p className="text-xs text-[#6B6B6B]">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <div className="flex gap-3">
        <Link href="/admin" className="rounded-full bg-[#1A1A1A] px-5 py-2 text-sm font-medium text-white hover:bg-[#333]">
          ← Admin Dashboard
        </Link>
        <Link href="/admin/outreach" className="rounded-full bg-[#E8760A] px-5 py-2 text-sm font-medium text-white hover:bg-[#cf6809]">
          Run Outreach →
        </Link>
      </div>
    </div>
  )
}

// Default milestones if none in DB
const defaultMilestones = [
  { mrr_target: 1000,   label: '$1K MRR',   description: '~10 Basic vendors. Proof the model works.' },
  { mrr_target: 5000,   label: '$5K MRR',   description: '~50 vendors. Seed round territory. First salaries possible.' },
  { mrr_target: 10000,  label: '$10K MRR',  description: '~100 vendors. Pre-Series A signal. Team can be paid properly.' },
  { mrr_target: 25000,  label: '$25K MRR',  description: '~250 vendors. Series A conversation. Team wealth becomes real.' },
  { mrr_target: 50000,  label: '$50K MRR',  description: '$600K ARR. $4.8M+ valuation. Life-changing territory.' },
  { mrr_target: 100000, label: '$100K MRR', description: '$1.2M ARR. $9.6M+ valuation. Everyone on the cap table is set.' },
]
