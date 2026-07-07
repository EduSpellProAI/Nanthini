export default function SpellingChallengesPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Spelling challenge management</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Plan weekly spelling themes and track participation with ease.</p>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">Current challenge: Weather words</p>
        <p className="mt-2 text-sm text-slate-600">Start date: Monday • End date: Friday</p>
      </div>
    </main>
  );
}
