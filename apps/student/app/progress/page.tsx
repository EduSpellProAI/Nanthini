import { ProgressCard } from '@/components/ui/ProgressCard';
import { RecentActivity } from '@/components/ui/RecentActivity';

export default function ProgressPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Your progress at a glance</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">Small, steady steps help you grow into a confident reader.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ProgressCard title="Reading level" value="A2" subtitle="CEFR level" trend="Improving" />
          <ProgressCard title="Words reviewed" value="248" subtitle="This month" trend="+24" />
          <ProgressCard title="Accuracy" value="94%" subtitle="Last 10 tasks" trend="Excellent" />
        </div>
      </section>
      <RecentActivity />
    </main>
  );
}
