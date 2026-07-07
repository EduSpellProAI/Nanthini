import { AdminDashboardCards } from '@/components/dashboard/AdminDashboardCards';

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Administration dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">A clear view of school operations and student progress.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Monitor attendance, teachers, content, and performance trends from one dependable control center.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-accent/10 px-4 py-3 text-sm font-semibold text-brand-accent">Weekly executive snapshot</div>
        </div>
      </section>

      <AdminDashboardCards />
    </main>
  );
}
