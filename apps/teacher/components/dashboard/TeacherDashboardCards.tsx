import { StatCard } from '@/components/ui/StatCard';
import { TaskList } from '@/components/ui/TaskList';

export function TeacherDashboardCards() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Students active" value="28" subtitle="Across 2 classrooms" accent="bg-brand-primary/10 text-brand-primary" />
        <StatCard title="Attendance" value="95%" subtitle="This week" accent="bg-brand-accent/10 text-brand-accent" />
        <StatCard title="Homework due" value="7" subtitle="Ready for review" accent="bg-amber-100 text-amber-700" />
        <StatCard title="Spelling streak" value="12" subtitle="Classes joined" accent="bg-sky-100 text-sky-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Weekly overview</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">A calm, organised plan helps your classroom stay focused and joyful.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Reading goals</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">19/24</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Quiz completions</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">82%</p>
            </div>
          </div>
        </div>

        <TaskList items={[
          { title: 'Review homework', detail: '6 reading reflections need feedback' },
          { title: 'Prepare spelling challenge', detail: 'Set Friday vocabulary tasks' },
          { title: 'Share class update', detail: 'Send family progress summary' },
        ]} />
      </div>
    </div>
  );
}
