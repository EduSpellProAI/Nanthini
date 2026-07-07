import { StatCard } from '@/components/ui/StatCard';

export default function StudentManagementPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Student management</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Track admissions, support plans, and growth milestones</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Enrolled students" value="2,430" detail="Across 18 classes" />
        <StatCard title="Need support" value="84" detail="Intervention ready" />
        <StatCard title="Progress updates" value="1,940" detail="Shared this week" />
      </div>
    </main>
  );
}
