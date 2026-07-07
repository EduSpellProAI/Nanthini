import { StatCard } from '@/components/ui/StatCard';

export default function SchoolAnalyticsPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">School analytics</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Attendance, performance, and engagement trends</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Average attendance" value="96.8%" detail="Consistent growth" />
        <StatCard title="Average reading score" value="82/100" detail="Up 5 points" />
        <StatCard title="Weekly engagement" value="91%" detail="High usage" />
      </div>
    </main>
  );
}
