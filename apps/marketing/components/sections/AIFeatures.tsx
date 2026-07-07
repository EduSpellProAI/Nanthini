const features = [
  {
    title: 'Spelling support',
    description: 'Personalised spelling tasks with instant feedback and pronunciation guidance.',
  },
  {
    title: 'Vocabulary growth',
    description: 'Adaptive word selection keeps learning aligned with each child’s stage.',
  },
  {
    title: 'Confidence coaching',
    description: 'Gentle encouragement and visual progress stories help children stay motivated.',
  },
  {
    title: 'Teacher automation',
    description: 'Reduce admin time with smart summaries and intervention suggestions.',
  },
];

export function AIFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI features</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Designed to make learning feel personal and powerful.</h2>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
