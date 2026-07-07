import { StatCard } from '@/components/ui/StatCard';

export default function ParentManagementPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Parent management</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Keep families informed and connected with school progress</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active family accounts" value="1,980" detail="92% engagement" />
        <StatCard title="Open messages" value="36" detail="Awaiting replies" />
        <StatCard title="Parent events" value="12" detail="Scheduled this month" />
      </div>
    </main>
  );
}
