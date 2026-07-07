const stats = [
  { value: '120+', label: 'Schools supported' },
  { value: '96%', label: 'Attendance uplift' },
  { value: '4.9/5', label: 'Teacher satisfaction' },
  { value: '24/7', label: 'AI assistance' },
];

export function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-soft backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-slate-50 p-5 text-center">
              <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
