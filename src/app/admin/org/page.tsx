import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrgPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-red-600 font-semibold">Unauthorized</p></div>
  }

  // Live metrics
  const [
    { count: vendors }, { count: leads }, { count: basic }, { count: premium },
    { count: outreachPending }, { count: outreachContacted }, { count: outreachListed },
    { data: recentLogs },
    { data: contentQueue },
    { data: blogDrafts },
  ] = await Promise.all([
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'basic'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
    supabase.from('outreach').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('outreach').select('*', { count: 'exact', head: true }).eq('status', 'contacted'),
    supabase.from('outreach').select('*', { count: 'exact', head: true }).eq('status', 'listed'),
    supabase.from('agent_logs').select('agent, action, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('content_queue').select('*', { count: 'exact', head: true }).eq('status', 'ready'),
    supabase.from('blog_drafts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ])

  const mrr = ((basic ?? 0) * 99) + ((premium ?? 0) * 249)
  const valuation = mrr * 12 * 8

  const departments = [
    {
      name: 'C-Suite',
      color: '#1A1A1A',
      members: [
        { title: 'CEO / Founder', agent: false, cadence: '—', name: 'Ishaan Saini', status: 'active', note: 'Strategic direction, relationships' },
      ],
    },
    {
      name: 'Revenue & Sales',
      color: '#C8A96A',
      members: [
        { title: 'Sales Agent', agent: true, cadence: 'Every 20 min', status: 'running', note: `Hot-window pitches, reactivation` },
        { title: 'Revenue Optimizer', agent: true, cadence: 'Every 20 min', status: 'running', note: `$49 featured upsell, churn recovery` },
        { title: 'Revenue Monitor', agent: true, cadence: 'Every 30 min', status: 'running', note: `MRR snapshots, milestone alerts` },
      ],
    },
    {
      name: 'Marketing',
      color: '#7c3aed',
      members: [
        { title: 'Marketing Agent', agent: true, cadence: 'Every 2 hours', status: 'running', note: `${contentQueue ?? 0} pieces queued` },
        { title: 'Content Queue', agent: false, cadence: '—', status: 'active', note: `${contentQueue ?? 0} ready to publish` },
      ],
    },
    {
      name: 'Growth & Outreach',
      color: '#0891b2',
      members: [
        { title: 'Outreach Agent', agent: true, cadence: 'Every 15 min', status: 'running', note: `${outreachPending ?? 0} pending → ${outreachContacted ?? 0} contacted → ${outreachListed ?? 0} listed` },
        { title: 'Growth Agent', agent: true, cadence: 'Every 3 hours', status: 'running', note: `SEO pages, partnerships, referrals` },
        { title: 'Market Analyst', agent: true, cadence: 'Every Monday', status: 'running', note: `Competitive intel, TAM/SAM/SOM` },
      ],
    },
    {
      name: 'Product & Strategy',
      color: '#059669',
      members: [
        { title: 'Product Strategist', agent: true, cadence: 'Every Sunday', status: 'running', note: `Feature ROI, viral loops, cohorts` },
        { title: 'SEO Content', agent: true, cadence: 'Every 3 hours', status: 'running', note: `${blogDrafts ?? 0} blog drafts waiting` },
      ],
    },
    {
      name: 'Community & Engagement',
      color: '#dc2626',
      members: [
        { title: 'Community Agent', agent: true, cadence: 'Every 4 hours', status: 'running', note: `Buyer newsletter, vendor milestones` },
        { title: 'Lead Response', agent: true, cadence: 'Every 10 min', status: 'running', note: `Instant vendor nudges for unread leads` },
      ],
    },
    {
      name: 'Finance & Wealth',
      color: '#16a34a',
      members: [
        { title: 'Revenue Agent', agent: true, cadence: 'Every Friday', status: 'running', note: `P&L snapshot, MRR forecast` },
        { title: 'Wealth Agent', agent: true, cadence: '1st of month', status: 'running', note: `Cap table, equity statements` },
        { title: 'Intelligence Agent', agent: true, cadence: 'Every 6 hours', status: 'running', note: `Supply/demand gaps, strategic reports` },
      ],
    },
  ]

  function $c(n: number) {
    if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`
    if (n >= 1e3) return `$${(n/1e3).toFixed(1)}K`
    return `$${n}`
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-[#C8A96A]" />
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A]">
          Corporate Command Center
        </h1>
      </div>
      <p className="mb-8 ml-4 text-sm text-[#6B6B6B]">
        Full organizational hierarchy. Every agent. Live metrics. Running 24/7.
      </p>

      {/* Live KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: 'MRR', value: $c(mrr), color: '#16a34a' },
          { label: 'Valuation', value: $c(valuation), color: '#C8A96A' },
          { label: 'Vendors', value: vendors ?? 0, color: '#1A1A1A' },
          { label: 'Leads', value: leads ?? 0, color: '#1A1A1A' },
          { label: 'Outreach Pipeline', value: (outreachPending ?? 0) + (outreachContacted ?? 0), color: '#0891b2' },
          { label: 'Content Queued', value: contentQueue ?? 0, color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">{k.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Org Chart */}
      <div className="mb-10 space-y-4">
        {departments.map(dept => (
          <div key={dept.name} className="rounded-xl border border-[#E5E5E0] bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: dept.color }}>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">{dept.name}</h2>
              <span className="ml-auto text-xs text-white/60">{dept.members.filter(m => m.agent).length} agents</span>
            </div>
            <div className="divide-y divide-[#E5E5E0]">
              {dept.members.map(m => (
                <div key={m.title} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${m.status === 'running' || m.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {m.title}
                        {m.agent && <span className="ml-2 text-xs bg-[#F3F3EF] text-[#6B6B6B] px-2 py-0.5 rounded-full">AI Agent</span>}
                        {'name' in m && <span className="ml-2 text-xs text-[#6B6B6B]">{(m as {name: string}).name}</span>}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">{m.note}</p>
                    </div>
                  </div>
                  {'cadence' in m && m.cadence !== '—' && (
                    <span className="text-xs text-[#6B6B6B] bg-[#FAFAF7] px-2 py-1 rounded-full whitespace-nowrap">{(m as {cadence: string}).cadence}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Agent Activity */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-[#1A1A1A]">Recent Agent Activity</h2>
        <div className="rounded-xl border border-[#E5E5E0] bg-white shadow-sm overflow-hidden">
          {(recentLogs ?? []).length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#6B6B6B]">No activity yet. Start the daemon to see live logs.</p>
          ) : (
            <table className="min-w-full divide-y divide-[#E5E5E0] text-sm">
              <tbody className="divide-y divide-[#E5E5E0]">
                {(recentLogs ?? []).map((log, i) => (
                  <tr key={i} className="hover:bg-[#FAFAF7]">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-[#F3F3EF] px-2 py-0.5 text-xs font-medium text-[#6B6B6B]">{log.agent}</span>
                    </td>
                    <td className="px-4 py-2 text-[#1A1A1A]">{log.action}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-[#6B6B6B]">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Start Daemon instructions */}
      <section className="mb-8 rounded-2xl border border-[#C8A96A] bg-[#F5ECD7] p-6">
        <h2 className="mb-2 font-semibold text-[#1A1A1A]">Start 24/7 Daemon on Your Mac</h2>
        <p className="mb-4 text-sm text-[#6B6B6B]">Run this once in your terminal to start all agents forever (auto-restarts on reboot):</p>
        <div className="space-y-2">
          <div className="rounded-lg bg-[#1A1A1A] p-3">
            <code className="text-sm text-green-400">cd ~/Downloads/mela && node scripts/activate-revenue.mjs</code>
            <p className="mt-1 text-xs text-gray-500">Run once — fires off the founding member offer + seeds outreach</p>
          </div>
          <div className="rounded-lg bg-[#1A1A1A] p-3">
            <code className="text-sm text-green-400">node scripts/daemon.mjs</code>
            <p className="mt-1 text-xs text-gray-500">Starts all 9 departments running forever</p>
          </div>
          <div className="rounded-lg bg-[#1A1A1A] p-3">
            <code className="text-sm text-green-400">bash scripts/install-daemon.sh</code>
            <p className="mt-1 text-xs text-gray-500">Installs daemon to auto-start on Mac boot</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {[
          { href: '/admin', label: '← Admin Dashboard' },
          { href: '/admin/outreach', label: 'Outreach Pipeline' },
          { href: '/admin/team', label: 'Team & Equity' },
        ].map(l => (
          <Link key={l.href} href={l.href} className="rounded-full bg-[#1A1A1A] px-5 py-2 text-sm font-medium text-white hover:bg-[#333]">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
