import { StatCard } from '@/components/ui/StatCard';
import { TimelineCard } from '@/components/ui/TimelineCard';

export function ParentDashboardCards() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Reading progress" value="92%" subtitle="This month" accent="bg-brand-primary/10 text-brand-primary" />
        <StatCard title="Attendance" value="96%" subtitle="Last 7 days" accent="bg-brand-accent/10 text-brand-accent" />
        <StatCard title="Homework done" value="5/6" subtitle="On time" accent="bg-amber-100 text-amber-700" />
        <StatCard title="Rewards earned" value="3" subtitle="This term" accent="bg-sky-100 text-sky-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Your child’s learning snapshot</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">Mila is building confidence with spelling and vocabulary this week.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Spelling accuracy</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">88%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">AI learning score</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">A2+</p>
            </div>
          </div>
        </div>

        <TimelineCard items={[
          { title: 'Teacher sent a message', detail: 'Mila completed the Friday spelling challenge.', time: '10 min ago' },
          { title: 'New homework posted', detail: 'Read a short story and answer three questions.', time: '1 hour ago' },
          { title: 'School announcement', detail: 'Science fair sign-up opens tomorrow.', time: 'Yesterday' },
        ]} />
      </div>
    </div>
  );
}
