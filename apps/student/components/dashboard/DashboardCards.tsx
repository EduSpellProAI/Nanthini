import { BadgeCard } from '@/components/ui/BadgeCard';
import { CEFRLevelCard } from '@/components/ui/CEFRLevelCard';
import { ProgressCard } from '@/components/ui/ProgressCard';
import { XPCard } from '@/components/ui/XPCard';

export function DashboardCards() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProgressCard title="Reading accuracy" value="92%" subtitle="Last 7 activities" trend="▲ 6% this week" />
        <ProgressCard title="Word mastery" value="184" subtitle="Words learned" trend="▲ 14 new words" />
        <ProgressCard title="Practice time" value="34 min" subtitle="Today" trend="Focus time improved" />
        <XPCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <CEFRLevelCard />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today’s goal</h2>
          <p className="mt-2 text-sm text-slate-600">Complete one spelling set and read three short stories before dinner.</p>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-2 w-3/4 rounded-full bg-brand-accent" />
          </div>
          <p className="mt-2 text-sm font-medium text-brand-accent">75% complete</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent badges</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <BadgeCard title="Bright Starter" description="Completed first 5 lessons" earned icon="🌟" />
            <BadgeCard title="Confident Reader" description="Read 3 stories this week" earned={false} icon="📚" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Weekly plan</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-xl bg-slate-50 p-3">Monday: Spelling practice with family words</li>
            <li className="rounded-xl bg-slate-50 p-3">Wednesday: Pronunciation warm-up</li>
            <li className="rounded-xl bg-slate-50 p-3">Friday: Vocabulary challenge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
