export function ReadingPracticeCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Reading practice</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}
