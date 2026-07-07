import { StatCard } from '@/components/ui/StatCard';

export default function ClassManagementPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Class management</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Coordinate timetables, rooms, and class composition</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active classes" value="18" detail="Balanced by year level" />
        <StatCard title="Room utilisation" value="89%" detail="Healthy scheduling" />
        <StatCard title="Intervention groups" value="6" detail="Ready to launch" />
      </div>
    </main>
  );
}
