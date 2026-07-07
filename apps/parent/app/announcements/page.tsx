export default function AnnouncementsPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">School announcements</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Important updates from school and upcoming sharing events.</p>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">Science fair sign-up opens tomorrow</p>
        <p className="mt-2 text-sm text-slate-600">Families can register online before 3 PM.</p>
      </div>
    </main>
  );
}
