import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Teacher overview</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">A calm dashboard for planning, support, and growth.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Review student progress, manage homework, and create spelling challenges from one thoughtful workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
              Open dashboard
            </Link>
            <Link href="/students" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
              Manage students
            </Link>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-soft">
          <p className="text-sm font-medium text-blue-200">This week</p>
          <h3 className="mt-3 text-2xl font-semibold">Excellent classroom momentum</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Attendance remains strong, reading goals are on track, and the next spelling challenge is almost ready to share.
          </p>
        </section>
      </div>
    </main>
  );
}
