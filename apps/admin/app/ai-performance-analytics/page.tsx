import { StatCard } from '@/components/ui/StatCard';

export default function AIPerformanceAnalyticsPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI performance analytics</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Understand how adaptive learning is driving outcomes</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Practice completion" value="87.4%" detail="Rising steadily" />
        <StatCard title="Adaptive accuracy" value="91%" detail="High confidence" />
        <StatCard title="Recommended interventions" value="24" detail="Automated this week" />
      </div>
    </main>
  );
}
