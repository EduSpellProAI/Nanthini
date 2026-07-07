import { StatCard } from '@/components/ui/StatCard';

export default function RolesPermissionsPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">User roles & permissions</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Manage access, teams, and platform privileges</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Role groups" value="6" detail="Admin, teacher, parent, student, support, analyst" />
        <StatCard title="Access reviews" value="3" detail="This week" />
        <StatCard title="Pending requests" value="12" detail="Role changes" />
      </div>
    </main>
  );
}
