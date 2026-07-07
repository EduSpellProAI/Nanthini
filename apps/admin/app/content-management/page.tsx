import { StatCard } from '@/components/ui/StatCard';

export default function ContentManagementPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Content management</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Review lesson content, curriculum updates, and publishing readiness</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Learning modules" value="184" detail="Approved" />
        <StatCard title="Pending reviews" value="9" detail="Awaiting editorial" />
        <StatCard title="Published this month" value="23" detail="Curriculum updates" />
      </div>
    </main>
  );
}
