'use client';

import { useState } from 'react';

type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface ParentProgressSummary {
  studentName: string;
  cefrBand: CefrBand;
  summary: string;
  strengthsToCelebrate: string[];
  growthAreas: string[];
  nextStepsAtHome: string[];
  weeklyTrend: Array<{ week: string; score: number }>;
}

export default function AILearningProgressPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParentProgressSummary | null>(null);

  async function generateSummary() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-parent-progress-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student: {
            id: 'student-mila',
            name: 'Mila',
            age: 10,
            currentLevel: 'intermediate',
            masteryScore: 79,
            strengths: ['Spelling recall', 'Reading confidence'],
            weaknesses: ['Grammar consistency', 'Inference detail'],
          },
          yearLevel: 4,
          recentScores: [68, 70, 73, 75, 78, 81],
        }),
      });

      const payload = (await response.json()) as { data?: ParentProgressSummary; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate AI learning summary.');
      }

      setResult(payload.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected summary error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">AI learning progress</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">Generate a parent-friendly summary with strengths, growth areas, and next steps.</p>
        <button
          type="button"
          onClick={generateSummary}
          disabled={loading}
          className="mt-4 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Parent Summary'}
        </button>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </section>

      {result ? (
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">{result.studentName}</p>
              <p className="mt-1 text-sm text-slate-600">Current CEFR: {result.cefrBand}</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{result.summary}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-semibold">Strengths to celebrate</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {result.strengthsToCelebrate.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">Growth areas</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {result.growthAreas.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          </article>

          <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Weekly trend and home support plan</h3>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-end gap-2">
                {result.weeklyTrend.map((point, index) => (
                  <div key={`${point.week}-${index}`} className="flex-1">
                    <div className="mx-auto w-full max-w-8 rounded-t bg-brand-primary/80" style={{ height: `${Math.max(20, point.score)}px` }} />
                    <p className="mt-1 text-center text-[10px] text-slate-500">{point.week.replace('Week ', 'W')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Next steps at home</p>
              <ul className="mt-2 list-inside list-decimal space-y-1">
                {result.nextStepsAtHome.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </section>
      ) : null}
    </main>
  );
}
