export default function PronunciationPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Pronunciation practice</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Listen carefully, repeat slowly, and build confidence with each sound.</p>

      <div className="mt-6 rounded-2xl bg-brand-primary/10 p-4">
        <h3 className="font-semibold text-slate-900">Word of the day</h3>
        <p className="mt-2 text-lg font-semibold text-slate-900">“beautiful”</p>
        <p className="mt-2 text-sm text-slate-600">Tap play, say the word, and compare it with the model voice.</p>
      </div>
    </main>
  );
}
