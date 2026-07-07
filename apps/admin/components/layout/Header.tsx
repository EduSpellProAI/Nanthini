export function Header() {
  return (
    <header className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">School administration</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Operational command center</h1>
      </div>
      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Live overview</div>
    </header>
  );
}
