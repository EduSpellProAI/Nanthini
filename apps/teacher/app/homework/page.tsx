'use client';

import { FormEvent, useState } from 'react';

interface HomeworkResult {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
}

export default function HomeworkPage() {
  const [topicName, setTopicName] = useState('Spelling pattern: silent e');
  const [topicCategory, setTopicCategory] = useState('Spelling');
  const [topicDifficulty, setTopicDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [objectiveTitle, setObjectiveTitle] = useState('Apply silent e pattern in sentences');
  const [objectiveDescription, setObjectiveDescription] = useState('Students can identify and write silent e words in guided writing tasks.');
  const [objectiveDifficulty, setObjectiveDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10));
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [parentSupportTips, setParentSupportTips] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HomeworkResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-homework-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName,
          topicCategory,
          topicDifficulty,
          objectiveTitle,
          objectiveDescription,
          objectiveDifficulty,
          dueDate,
          estimatedMinutes,
          parentSupportTips,
        }),
      });

      const payload = (await response.json()) as { data?: HomeworkResult; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate homework.');
      }

      setResult(payload.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected homework generation error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">AI Homework Generator</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Create curriculum-aligned homework with instructional clarity, measurable expectations, and family-friendly guidance.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Homework setup</h3>

          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Topic name
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={topicName} onChange={(event) => setTopicName(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Topic category
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={topicCategory} onChange={(event) => setTopicCategory(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Topic difficulty
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={topicDifficulty} onChange={(event) => setTopicDifficulty(event.target.value as 'beginner' | 'intermediate' | 'advanced')}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Objective title
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={objectiveTitle} onChange={(event) => setObjectiveTitle(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Objective description
              <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" value={objectiveDescription} onChange={(event) => setObjectiveDescription(event.target.value)} required />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Objective difficulty
                <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={objectiveDifficulty} onChange={(event) => setObjectiveDifficulty(event.target.value as 'beginner' | 'intermediate' | 'advanced')}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Due date
                <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-end">
              <label className="block text-sm font-medium text-slate-700">
                Estimated minutes
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="number"
                  min={5}
                  max={180}
                  value={estimatedMinutes}
                  onChange={(event) => setEstimatedMinutes(Number(event.target.value))}
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={parentSupportTips} onChange={(event) => setParentSupportTips(event.target.checked)} />
                Include parent support tips
              </label>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Homework'}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Generated homework</h3>

          {!result ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">Submit the setup form to generate a homework task with clear steps and expected outcomes.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Title</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{result.title}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Instructions</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{result.instructions}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                Due date: {result.dueDate}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
