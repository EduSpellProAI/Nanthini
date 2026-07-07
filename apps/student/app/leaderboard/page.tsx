import { BadgeCard } from '@/components/ui/BadgeCard';

export default function LeaderboardPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Weekly leaderboard</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Your class is working hard together. Keep going to climb higher.</p>

      <div className="mt-6 space-y-3">
        {[{ name: 'Maya', xp: '1,240 XP', rank: '1' }, { name: 'Oliver', xp: '1,180 XP', rank: '2' }, { name: 'Ava', xp: '1,140 XP', rank: '3' }].map((student) => (
          <div key={student.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">{student.rank}</div>
              <div>
                <p className="font-semibold text-slate-900">{student.name}</p>
                <p className="text-sm text-slate-600">Weekly progress</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-700">{student.xp}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <BadgeCard title="Class champion" description="Finish the weekly challenge" earned icon="🏅" />
      </div>
    </main>
  );
}
