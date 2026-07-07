import { TeacherDashboardCards } from '@/components/dashboard/TeacherDashboardCards';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Teacher dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">A clear view of learning, support, and progress.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Keep your class organised with thoughtful planning, student insights, and structured family communication.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-accent/10 px-4 py-3 text-sm font-semibold text-brand-accent">2 classes active</div>
        </div>
      </section>

      <TeacherDashboardCards />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">Class analytics</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Live overview by CEFR and subject performance</h3>
          </div>
          <a href="/reports" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400">Open analytics reports</a>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Average mastery</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">76%</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-brand-primary" style={{ width: '76%' }} />
            </div>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Students needing support</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">5</p>
            <p className="mt-2 text-sm text-slate-600">Focused in grammar and inference topics</p>
          </article>
          <article className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">CEFR distribution</p>
            <p className="mt-2 text-sm text-slate-700">A1: 4 • A1+: 8 • A2: 11 • A2+: 6 • B1: 2</p>
            <p className="mt-2 text-sm text-slate-600">Most learners are on-track for Year benchmarks</p>
          </article>
        </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI Teacher Assistant</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Copilot For Planning, CEFR, And Intervention</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Ask syllabus and CEFR questions in English, Bahasa Melayu, or Tamil. Receive activity ideas, differentiation strategies, lesson improvements, and automatic worksheet, quiz, and homework suggestions.
            </p>
            <Link href="/ai-assistant" className="mt-4 inline-flex text-sm font-semibold text-brand-primary hover:underline">
              Launch AI Teacher Assistant
            </Link>
          </div>
      </section>
    </main>
  );
}
