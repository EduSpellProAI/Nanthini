export default function VocabularyPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Vocabulary adventures</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Learn new words through simple stories, matching games, and friendly examples.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Curious</h3>
          <p className="mt-2 text-sm text-slate-600">Wanting to learn more about something.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Brave</h3>
          <p className="mt-2 text-sm text-slate-600">Ready to try even when something feels tricky.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Calm</h3>
          <p className="mt-2 text-sm text-slate-600">Feeling peaceful and steady while learning.</p>
        </div>
      </div>
    </main>
  );
}
