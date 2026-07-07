import { StatCard } from '@/components/ui/StatCard';

export default function QuizManagementPage() {
  return (
    <main className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Quiz management</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create, review, and moderate assessments for every class</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active quizzes" value="126" detail="Across subjects" />
        <StatCard title="Pending moderation" value="8" detail="New submissions" />
        <StatCard title="Average completion" value="89%" detail="Strong participation" />
      </div>
    </main>
  );
}
