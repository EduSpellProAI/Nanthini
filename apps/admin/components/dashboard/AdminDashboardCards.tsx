const stats = [
  { label: 'Active teachers', value: '128', detail: '+6 this term' },
  { label: 'Students enrolled', value: '2,430', detail: '+92 new learners' },
  { label: 'Attendance rate', value: '96.8%', detail: 'Above target' },
  { label: 'AI practice completion', value: '87.4%', detail: 'Steady growth' },
];

const highlights = [
  'Strong reading growth in Year 4 and 5 cohorts.',
  'Attendance intervention targets are trending positively.',
  'New content library reviews are ready for publishing.',
];

export function AdminDashboardCards() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-1 text-sm text-brand-accent">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Today’s priorities</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {highlights.map((item) => (
            <li key={item} className="rounded-2xl bg-slate-50 p-3">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
