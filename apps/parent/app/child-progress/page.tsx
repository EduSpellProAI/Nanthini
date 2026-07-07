export default function ChildProgressPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Child progress</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Mila has shown strong progress in reading, spelling, and confidence.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Reading fluency</h3>
          <p className="mt-2 text-sm text-slate-600">Improved from 78% to 91% this term.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Vocabulary growth</h3>
          <p className="mt-2 text-sm text-slate-600">Learned 24 new words in the last month.</p>
        </div>
      </div>
    </main>
  );
}
