'use client';

import { FormEvent, useState } from 'react';

type ReportStyle = 'formal' | 'encouraging' | 'concise';

interface ParentProgressReport {
  studentName: string;
  reportingPeriod: string;
  style: ReportStyle;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  attendanceSummary: string;
  homeworkSummary: string;
  learningRecommendations: string[];
  parentLetter: string;
  meetingSummary: string;
}

export default function ParentReportsPage() {
  const [style, setStyle] = useState<ReportStyle>('encouraging');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ParentProgressReport | null>(null);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-parent-communication-reporting', {
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
            strengths: ['Reading confidence', 'Spelling retention'],
            weaknesses: ['Grammar consistency', 'Inference detail'],
          },
          reportingPeriod: 'Term 2, 2026',
          attendanceRate: 94,
          homeworkCompletionRate: 87,
          subjectScores: [
            {
              subject: 'Reading',
              score: 82,
              cefrBand: 'A2',
              topics: [
                { topic: 'Main idea', score: 85 },
                { topic: 'Inference', score: 76 },
              ],
            },
            {
              subject: 'Writing',
              score: 74,
              cefrBand: 'A2',
              topics: [
                { topic: 'Grammar', score: 69 },
                { topic: 'Organisation', score: 77 },
              ],
            },
            {
              subject: 'Spelling',
              score: 88,
              cefrBand: 'A2+',
              topics: [
                { topic: 'Word families', score: 90 },
                { topic: 'Irregular words', score: 84 },
              ],
            },
          ],
          style,
        }),
      });

      const payload = (await response.json()) as { data?: ParentProgressReport; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate parent report.');
      }

      setReport(payload.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected report generation error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Parent Reports</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Parent-friendly communication summary</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">Review strengths, growth areas, attendance, homework completion, and practical next steps in a friendly format.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleGenerate} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Summary style</h3>

          <label className="block text-sm font-medium text-slate-700">
            Report style
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={style} onChange={(event) => setStyle(event.target.value as ReportStyle)}>
              <option value="formal">Formal</option>
              <option value="encouraging">Encouraging</option>
              <option value="concise">Concise</option>
            </select>
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60">
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </form>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Generated summary</h3>

          {!report ? (
            <p className="text-sm leading-7 text-slate-600">Generate a parent report to view communication summary, parent letter, and meeting notes.</p>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{report.studentName}</p>
                <p className="mt-1">{report.reportingPeriod} • Style: {report.style}</p>
                <p className="mt-2">{report.summary}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-semibold">Strengths</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {report.strengths.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">Growth areas</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {report.weaknesses.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Attendance and homework</p>
                <p className="mt-2"><span className="font-semibold">Attendance:</span> {report.attendanceSummary}</p>
                <p className="mt-1"><span className="font-semibold">Homework:</span> {report.homeworkSummary}</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Home recommendations</p>
                <ul className="mt-2 list-inside list-decimal space-y-1">
                  {report.learningRecommendations.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Parent letter</p>
                <p className="mt-2 whitespace-pre-line">{report.parentLetter}</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Meeting summary</p>
                <p className="mt-2 whitespace-pre-line">{report.meetingSummary}</p>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
