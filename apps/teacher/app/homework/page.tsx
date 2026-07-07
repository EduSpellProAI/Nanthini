export default function HomeworkPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Homework</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Keeping reading tasks and practice activities organised for families.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Reading reflection</h3>
          <p className="mt-2 text-sm text-slate-600">Due tomorrow • 6 students pending</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Word practice</h3>
          <p className="mt-2 text-sm text-slate-600">Due Friday • 12 students completed</p>
        </div>
      </div>
    </main>
  );
}
