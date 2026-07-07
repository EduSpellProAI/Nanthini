import { StatCard } from '@/components/ui/StatCard';

export default function NotificationsPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Notifications</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Configure system updates and school-wide communication</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Scheduled messages" value="24" detail="This week" />
        <StatCard title="Unread alerts" value="11" detail="Need review" />
        <StatCard title="Delivery success" value="98.2%" detail="Reliable distribution" />
      </div>
    </main>
  );
}
