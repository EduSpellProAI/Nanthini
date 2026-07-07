import { ProgressCard } from '@/components/ui/ProgressCard';

export default function ProfilePage() {
  return (
    <main className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-2xl font-semibold text-white">M</div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Maya Patel</h2>
            <p className="text-sm text-slate-600">Grade 3 • Curious learner</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProgressCard title="Preferred reading time" value="7:30 PM" subtitle="Quiet evening practice" trend="Consistent" />
          <ProgressCard title="Favorite topic" value="Nature" subtitle="Forest animals" trend="Great enthusiasm" />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Learning support</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="rounded-xl bg-slate-50 p-3">Audio support is enabled for pronunciation exercises.</li>
          <li className="rounded-xl bg-slate-50 p-3">Daily reminders are set for 20 minutes of practice.</li>
          <li className="rounded-xl bg-slate-50 p-3">Parent updates are shared after each completed lesson.</li>
        </ul>
      </section>
    </main>
  );
}
