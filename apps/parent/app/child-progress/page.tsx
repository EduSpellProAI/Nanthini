export default function ChildProgressPage() {
  const subjectPerformance = [
    { subject: 'Reading', cefr: 'A2', score: 81 },
    { subject: 'Writing', cefr: 'A2', score: 75 },
    { subject: 'Spelling', cefr: 'A2+', score: 87 },
  ];

  const weeklyTrend = [68, 70, 73, 75, 78, 81];

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Child progress summary</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">A clear, parent-friendly view of strengths, growth areas, and weekly learning trends.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Performance by subject and CEFR</h3>
          {subjectPerformance.map((item) => (
            <article key={item.subject} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{item.subject}</p>
                <p className="text-sm text-slate-600">{item.score}% • CEFR {item.cefr}</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand-primary" style={{ width: `${item.score}%` }} />
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Weekly learning trend</h3>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-end gap-2">
              {weeklyTrend.map((score, index) => (
                <div key={`trend-${score}-${index}`} className="flex-1">
                  <div className="mx-auto w-full max-w-8 rounded-t bg-brand-primary/80" style={{ height: `${Math.max(20, score)}px` }} />
                  <p className="mt-1 text-center text-[10px] text-slate-500">W{index + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Strengths to celebrate</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Strong spelling retention with weekly revision.</li>
              <li>Confident reading aloud and understanding key story points.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Growth areas</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Grammar accuracy in longer writing tasks.</li>
              <li>Using text evidence for inference questions.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
