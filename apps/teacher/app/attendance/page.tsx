export default function AttendancePage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Attendance</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Monitor participation trends and follow up with care.</p>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">Weekly attendance: 95%</p>
        <p className="mt-2 text-sm text-slate-600">Three students were absent for one day this week.</p>
      </div>
    </main>
  );
}
