import { ProgressCard } from '@/components/ui/ProgressCard';
import { RecentActivity } from '@/components/ui/RecentActivity';

function width(score: number): string {
  return `${Math.max(0, Math.min(100, score))}%`;
}

export default function ProgressPage() {
  const subjectPerformance = [
    {
      subject: 'Reading',
      cefr: 'A2',
      score: 82,
      topics: [
        { name: 'Main idea', score: 84, trend: '+4' },
        { name: 'Inference', score: 77, trend: '+2' },
        { name: 'Vocabulary in context', score: 85, trend: '+5' },
      ],
    },
    {
      subject: 'Writing',
      cefr: 'A2',
      score: 76,
      topics: [
        { name: 'Sentence variety', score: 74, trend: '+2' },
        { name: 'Grammar accuracy', score: 70, trend: '+1' },
        { name: 'Narrative ideas', score: 82, trend: '+4' },
      ],
    },
    {
      subject: 'Spelling',
      cefr: 'A2+',
      score: 88,
      topics: [
        { name: 'Word families', score: 89, trend: '+6' },
        { name: 'Irregular words', score: 84, trend: '+3' },
        { name: 'Syllable patterns', score: 91, trend: '+5' },
      ],
    },
  ];

  const trends = [66, 69, 72, 74, 77, 81];
  const strengths = ['Spelling accuracy improves quickly with timed practice.', 'Vocabulary recall is consistently strong in story-based tasks.'];
  const weaknesses = ['Grammar accuracy drops in longer writing responses.', 'Inference questions need closer evidence selection.'];
  const recommendations = [
    'Complete two short grammar fix-it activities after each writing session.',
    'Use a highlight-and-justify strategy for comprehension inference questions.',
    'Continue daily 10-minute spelling bursts to maintain momentum.',
  ];

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Your learning analytics dashboard</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">Track your progress by subject, CEFR level, and topic with clear trends and action steps.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ProgressCard title="Current CEFR" value="A2+" subtitle="Target B1" trend="On track" />
          <ProgressCard title="Average score" value="82%" subtitle="Across subjects" trend="▲ 7% in 6 weeks" />
          <ProgressCard title="Topics mastered" value="18" subtitle="This term" trend="+4 this month" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Performance by subject and topic</h3>
          {subjectPerformance.map((subject) => (
            <article key={subject.subject} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{subject.subject}</p>
                <p className="text-sm text-slate-600">{subject.score}% • CEFR {subject.cefr}</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand-primary" style={{ width: width(subject.score) }} />
              </div>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {subject.topics.map((topic) => (
                  <li key={topic.name}>
                    {topic.name}: {topic.score}% ({topic.trend})
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Trends and recommendations</h3>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Learning trend (6 weeks)</p>
            <div className="mt-3 flex items-end gap-2">
              {trends.map((score, index) => (
                <div key={`trend-${score}-${index}`} className="flex-1">
                  <div className="mx-auto h-28 w-full max-w-8 rounded-t bg-brand-primary/80" style={{ height: `${Math.max(20, score)}px` }} />
                  <p className="mt-1 text-center text-[10px] text-slate-500">W{index + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Strengths</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {strengths.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Growth areas</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {weaknesses.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">AI recommendations</p>
            <ul className="mt-2 list-inside list-decimal space-y-1">
              {recommendations.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <RecentActivity />
    </main>
  );
}
