'use client';

import { FormEvent, useMemo, useState } from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface LessonActivity {
  id: string;
  title: string;
  type: 'discussion' | 'practice' | 'game' | 'reflection';
  durationMinutes: number;
}

interface LessonTemplate {
  id: string;
  title: string;
  objectives: Array<{ id: string; title: string; description: string }>;
  activities: LessonActivity[];
  materials: string[];
  assessmentPlan: string;
  totalDurationMinutes: number;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: CefrBand;
  difficulty: Difficulty;
}

function parseLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function expectedCefr(yearLevel: number): CefrBand {
  switch (yearLevel) {
    case 1:
      return 'Pre-A1';
    case 2:
      return 'A1';
    case 3:
      return 'A1+';
    case 4:
      return 'A2';
    case 5:
      return 'A2+';
    case 6:
      return 'B1';
    default:
      return 'A1';
  }
}

export default function LessonPlannerPage() {
  const [topicName, setTopicName] = useState('Narrative writing with sequencing language');
  const [topicCategory, setTopicCategory] = useState('Writing');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [yearLevel, setYearLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(4);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [objectivesInput, setObjectivesInput] = useState('Use sequencing words in a short paragraph\nIdentify beginning, middle, and end in model text');
  const [studentNeedsInput, setStudentNeedsInput] = useState('Support EAL learners with visual word bank\nProvide extension challenge for confident writers');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LessonTemplate | null>(null);

  const objectiveTitles = useMemo(() => parseLines(objectivesInput), [objectivesInput]);
  const studentNeeds = useMemo(() => parseLines(studentNeedsInput), [studentNeedsInput]);
  const cefrBand = useMemo(() => expectedCefr(yearLevel), [yearLevel]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-lesson-plan-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName,
          topicCategory,
          difficulty,
          yearLevel,
          durationMinutes,
          objectiveTitles,
          studentNeeds,
        }),
      });

      const payload = (await response.json()) as { data?: LessonTemplate; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate lesson plan.');
      }

      setResult(payload.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected lesson plan error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Lesson Plan Generator</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">CEFR-aligned planning for Year 1-6</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Generate structured lesson plans with objectives, sequenced activities, materials, assessment strategy, and timed pacing aligned to CEFR progression.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Plan setup</h3>

          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Topic name
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={topicName} onChange={(event) => setTopicName(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Topic category
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={topicCategory} onChange={(event) => setTopicCategory(event.target.value)} required />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Year level
                <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={yearLevel} onChange={(event) => setYearLevel(Number(event.target.value) as 1 | 2 | 3 | 4 | 5 | 6)}>
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5</option>
                  <option value={6}>Year 6</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">Mapped CEFR band: {cefrBand}</p>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Difficulty
                <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Total lesson duration (minutes)
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min={20}
                max={120}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Learning objectives (one per line)
              <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" value={objectivesInput} onChange={(event) => setObjectivesInput(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Student needs and differentiation notes (one per line)
              <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" value={studentNeedsInput} onChange={(event) => setStudentNeedsInput(event.target.value)} />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || objectiveTitles.length === 0}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Lesson Plan'}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Generated plan</h3>

          {!result ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">Generate a lesson plan to view CEFR alignment, objectives, activities, materials, assessment, and total timing.</p>
          ) : (
            <div className="mt-4 space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{result.title}</p>
                <p className="mt-1">Year {result.yearLevel} • CEFR {result.cefrBand} • {result.totalDurationMinutes} minutes</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Learning Objectives</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.objectives.map((item) => (
                    <li key={item.id} className="rounded-xl bg-slate-50 px-3 py-2">{item.title}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Activities and Timing</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.activities.map((activity) => (
                    <li key={activity.id} className="rounded-xl border border-slate-200 px-3 py-2">
                      <p className="font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500">{activity.type} • {activity.durationMinutes} minutes</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Materials</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.materials.map((item) => (
                    <li key={item} className="rounded-xl bg-slate-50 px-3 py-2">{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assessment</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{result.assessmentPlan}</p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
