import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Welcome back</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Sign in to continue your reading journey.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Practice spelling, build vocabulary, and celebrate progress with guided lessons designed for young learners.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
              Continue to dashboard
            </Link>
            <Link href="/profile" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
              View profile
            </Link>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-soft">
          <p className="text-sm font-medium text-blue-200">Today’s focus</p>
          <h3 className="mt-3 text-2xl font-semibold">“The Rainy Day Parade”</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Finish one pronunciation warm-up and unlock a new badge for your weekly reading goal.
          </p>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Lesson progress</span>
              <span className="font-semibold text-brand-accent">68%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/20">
              <div className="h-2 w-2/3 rounded-full bg-brand-accent" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
