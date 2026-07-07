export default function ReportsPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Review performance patterns and share helpful summaries with families.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Reading growth</h3>
          <p className="mt-2 text-sm text-slate-600">Steady improvement across sentence fluency and comprehension.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Support needs</h3>
          <p className="mt-2 text-sm text-slate-600">Three students would benefit from extra pronunciation practice.</p>
        </div>
      </div>
    </main>
  );
}
