export default function ClassesPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Class management</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Organise your daily plan, shared goals, and group activities with confidence.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Grade 3A</h3>
          <p className="mt-2 text-sm text-slate-600">Reading fluency, spelling routines, and weekly reflection.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Grade 3B</h3>
          <p className="mt-2 text-sm text-slate-600">Small group support and pronunciation practice.</p>
        </div>
      </div>
    </main>
  );
}
