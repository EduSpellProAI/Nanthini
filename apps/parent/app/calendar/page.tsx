export default function CalendarPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Calendar</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Plan school events, homework deadlines, and family routines.</p>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">Upcoming</p>
        <p className="mt-2 text-sm text-slate-600">Thursday: Parent-teacher check-in • Friday: Spelling challenge</p>
      </div>
    </main>
  );
}
