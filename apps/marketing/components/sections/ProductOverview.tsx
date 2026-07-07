const items = [
  {
    title: 'Adaptive practice',
    description: 'Children receive exercises tailored to their current level and confidence.',
  },
  {
    title: 'Teacher insights',
    description: 'Easy-to-read dashboards help staff plan interventions and celebrate growth.',
  },
  {
    title: 'Parent visibility',
    description: 'Families stay connected with weekly summaries and clear next-step guidance.',
  },
];

export function ProductOverview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-soft backdrop-blur">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-secondary">Product overview</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">A complete learning ecosystem for modern primary schools.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">From early phonics to confident spelling, EduSpell Pro AI combines engaging content, adaptive feedback, and rich reporting in one polished experience.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
