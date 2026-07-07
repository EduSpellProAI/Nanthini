import { StatCard } from '@/components/ui/StatCard';

export default function AttendanceMonitoringPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Attendance monitoring</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Track daily attendance and intervene early when needed</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Today present" value="2,318" detail="95.6%" />
        <StatCard title="Late arrivals" value="47" detail="Below weekly average" />
        <StatCard title="Absence alerts" value="19" detail="Requiring follow-up" />
      </div>
    </main>
  );
}
