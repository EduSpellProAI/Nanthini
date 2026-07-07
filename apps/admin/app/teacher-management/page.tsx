import { StatCard } from '@/components/ui/StatCard';

export default function TeacherManagementPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Teacher management</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Support staffing, schedules, and classroom delivery</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active faculty" value="128" detail="98% workload balance" />
        <StatCard title="Pending approvals" value="14" detail="Lesson plans" />
        <StatCard title="Training sessions" value="7" detail="This quarter" />
      </div>
    </main>
  );
}
