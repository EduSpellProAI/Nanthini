import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
      <div className="flex flex-col justify-center">
        <div className="inline-flex w-fit items-center rounded-full border border-brand-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-primary shadow-sm">
          AI-powered reading, spelling, and confidence growth
        </div>
        <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Bring joyful, measurable learning to every classroom.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          EduSpell Pro AI helps schools deliver personalised spelling, pronunciation, and vocabulary practice that keeps children engaged and teachers informed.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/contact" className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.02]">
            Schedule a live demo
          </Link>
          <Link href="/features" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-primary hover:text-brand-primary">
            Explore features
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-brand-primary via-sky-500 to-brand-secondary p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/80">Weekly readiness</p>
              <p className="mt-2 text-3xl font-semibold">92% student confidence</p>
            </div>
            <div className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-semibold">Live</div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/20 p-4">
              <p className="text-sm text-white/80">Spelling accuracy</p>
              <p className="mt-2 text-2xl font-semibold">+18%</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4">
              <p className="text-sm text-white/80">Practice streaks</p>
              <p className="mt-2 text-2xl font-semibold">4.7 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
