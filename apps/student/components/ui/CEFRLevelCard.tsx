export function CEFRLevelCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Current level</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">A2</p>
        </div>
        <div className="rounded-full bg-brand-accent/10 px-3 py-2 text-sm font-semibold text-brand-accent">CEFR</div>
      </div>
      <p className="mt-3 text-sm text-slate-600">You are building confidence with everyday words and phrases.</p>
    </div>
  );
}
