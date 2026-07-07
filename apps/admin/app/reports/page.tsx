import { StatCard } from '@/components/ui/StatCard';

export default function ReportsPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Reports</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create and review operational and academic reports</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Reports ready" value="18" detail="Scheduled" />
        <StatCard title="Custom exports" value="7" detail="Requested today" />
        <StatCard title="Last generated" value="2h ago" detail="Performance summary" />
      </div>
    </main>
  );
}
