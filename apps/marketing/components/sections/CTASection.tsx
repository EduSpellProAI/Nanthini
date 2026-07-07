import Link from 'next/link';

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-brand-primary to-brand-secondary p-8 text-white shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Ready to get started?</p>
            <h2 className="mt-2 text-3xl font-semibold">Make learning feel exciting and measurable.</h2>
          </div>
          <Link href="/contact" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-primary shadow-sm transition hover:scale-[1.02]">
            Request a tailored proposal
          </Link>
        </div>
      </div>
    </section>
  );
}
