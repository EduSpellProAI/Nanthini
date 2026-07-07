import { StatCard } from '@/components/ui/StatCard';

export default function SystemSettingsPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">System settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Maintain platform health, integrations, and policy controls</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="System status" value="Healthy" detail="All services online" />
        <StatCard title="Security checks" value="12" detail="Completed today" />
        <StatCard title="Maintenance window" value="Next Friday" detail="Scheduled" />
      </div>
    </main>
  );
}
