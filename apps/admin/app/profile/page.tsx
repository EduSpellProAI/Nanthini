import { StatCard } from '@/components/ui/StatCard';

export default function ProfilePage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Maintain your leadership profile and operational preferences</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Account role" value="Head administrator" detail="Primary access" />
        <StatCard title="Security status" value="Verified" detail="2-step enabled" />
        <StatCard title="Notification preference" value="Daily digest" detail="Delivered at 8:00 AM" />
      </div>
    </main>
  );
}
