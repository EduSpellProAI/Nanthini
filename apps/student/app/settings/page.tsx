export default function SettingsPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Personalize the experience to suit your learning routine.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          <p className="mt-2 text-sm text-slate-600">Daily reminders and weekly progress summaries.</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-900">Accessibility</h3>
          <p className="mt-2 text-sm text-slate-600">Larger text, audio support, and calm color themes.</p>
        </div>
      </div>
    </main>
  );
}
