export default function SpellingPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Spelling practice</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Work through short word families with picture clues and audio support.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Today’s challenge</h3>
          <p className="mt-2 text-sm text-slate-600">Write the missing word in the sentence: “The cat is on the ___.”</p>
        </div>
        <div className="rounded-2xl bg-brand-accent/10 p-4">
          <h3 className="font-semibold text-slate-900">Tip of the day</h3>
          <p className="mt-2 text-sm text-slate-600">Say the word out loud, then check the letters one by one.</p>
        </div>
      </div>
    </main>
  );
}
