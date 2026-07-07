import { BadgeCard } from '@/components/ui/BadgeCard';

export default function BadgesPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Badges and achievements</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Celebrate your learning milestones and keep earning new rewards.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <BadgeCard title="Bright Starter" description="Completed your first 5 lessons" earned icon="🌟" />
        <BadgeCard title="Story Explorer" description="Read 4 stories in one week" earned icon="📖" />
        <BadgeCard title="Word Wizard" description="Mastered 20 new words" earned={false} icon="🪄" />
        <BadgeCard title="Calm Speaker" description="Finished 3 pronunciation sessions" earned={false} icon="🎤" />
      </div>
    </main>
  );
}
