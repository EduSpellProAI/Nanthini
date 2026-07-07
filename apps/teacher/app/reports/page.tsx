'use client';

import { FormEvent, useMemo, useState } from 'react';

type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface TopicPerformance {
  topic: string;
  score: number;
  trendDelta: number;
}

interface SubjectPerformance {
  subject: string;
  cefrBand: CefrBand;
  score: number;
  topics: TopicPerformance[];
}

interface StudentProgressAnalytics {
  studentId: string;
  studentName: string;
  yearLevel: number;
  cefrBand: CefrBand;
  overallScore: number;
  subjectPerformance: SubjectPerformance[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  trends: Array<{ week: string; score: number }>;
}

interface ClassAnalytics {
  className: string;
  studentCount: number;
  averageScore: number;
  cefrDistribution: Array<{ cefrBand: CefrBand; students: number }>;
  subjectAverages: Array<{ subject: string; score: number }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  atRiskStudents: Array<{ studentId: string; studentName: string; cefrBand: CefrBand; overallScore: number }>;
}

interface ExportPayload {
  pdfBase64: string;
  docxBase64: string;
  pdfFileName: string;
  docxFileName: string;
}

function toBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const data = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    data[index] = bytes.charCodeAt(index);
  }

  return new Blob([data], { type: mimeType });
}

function chartWidth(score: number): string {
  return `${Math.min(100, Math.max(0, score))}%`;
}

export default function ReportsPage() {
  const [className, setClassName] = useState('Year 4 Sapphire');
  const [yearLevel, setYearLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(4);
  const [studentName, setStudentName] = useState('Alya Tan');
  const [studentId, setStudentId] = useState('student-alya-tan');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentProgressAnalytics | null>(null);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);

  const subjectPerformance = useMemo<SubjectPerformance[]>(
    () => [
      {
        subject: 'Reading',
        cefrBand: 'A2',
        score: 78,
        topics: [
          { topic: 'Main idea', score: 81, trendDelta: 5 },
          { topic: 'Inference', score: 72, trendDelta: 2 },
          { topic: 'Vocabulary in context', score: 79, trendDelta: 4 },
        ],
      },
      {
        subject: 'Writing',
        cefrBand: 'A2',
        score: 74,
        topics: [
          { topic: 'Sentence structure', score: 76, trendDelta: 3 },
          { topic: 'Grammar accuracy', score: 70, trendDelta: 1 },
          { topic: 'Creative expression', score: 77, trendDelta: 4 },
        ],
      },
      {
        subject: 'Spelling',
        cefrBand: 'A2+',
        score: 83,
        topics: [
          { topic: 'Syllable patterns', score: 84, trendDelta: 6 },
          { topic: 'Irregular words', score: 81, trendDelta: 4 },
          { topic: 'Word families', score: 85, trendDelta: 5 },
        ],
      },
    ],
    []
  );

  const trends = useMemo(
    () => [
      { week: 'Week 1', score: 68 },
      { week: 'Week 2', score: 71 },
      { week: 'Week 3', score: 72 },
      { week: 'Week 4', score: 74 },
      { week: 'Week 5', score: 76 },
      { week: 'Week 6', score: 78 },
    ],
    []
  );

  const classStudents = useMemo(
    () => [
      { studentId: 'student-alya-tan', studentName: 'Alya Tan', cefrBand: 'A2' as CefrBand, overallScore: 78 },
      { studentId: 'student-iman-lee', studentName: 'Iman Lee', cefrBand: 'A2+' as CefrBand, overallScore: 84 },
      { studentId: 'student-daniel-kim', studentName: 'Daniel Kim', cefrBand: 'A1+' as CefrBand, overallScore: 59 },
      { studentId: 'student-zara-ng', studentName: 'Zara Ng', cefrBand: 'A2' as CefrBand, overallScore: 73 },
      { studentId: 'student-samir-joseph', studentName: 'Samir Joseph', cefrBand: 'A1' as CefrBand, overallScore: 52 },
    ],
    []
  );

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-student-progress-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          className,
          yearLevel,
          student: {
            id: studentId,
            name: studentName,
            masteryScore: subjectPerformance.reduce((sum, item) => sum + item.score, 0) / subjectPerformance.length,
          },
          subjectPerformance,
          trends,
          classStudents,
        }),
      });

      const payload = (await response.json()) as {
        data?: { studentAnalytics: StudentProgressAnalytics; classAnalytics: ClassAnalytics };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate analytics.');
      }

      setStudentAnalytics(payload.data.studentAnalytics);
      setClassAnalytics(payload.data.classAnalytics);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected analytics generation error.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(type: 'pdf' | 'docx' | 'print') {
    if (!studentAnalytics) return;
    setExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-student-progress-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export', studentAnalytics }),
      });

      const payload = (await response.json()) as { data?: ExportPayload; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to export analytics report.');
      }

      if (type === 'pdf') {
        const blob = toBlob(payload.data.pdfBase64, 'application/pdf');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = payload.data.pdfFileName;
        link.click();
        URL.revokeObjectURL(url);
      }

      if (type === 'docx') {
        const blob = toBlob(payload.data.docxBase64, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = payload.data.docxFileName;
        link.click();
        URL.revokeObjectURL(url);
      }

      if (type === 'print') {
        const blob = toBlob(payload.data.pdfBase64, 'application/pdf');
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected export error.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Student Progress Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Student and class analytics dashboard</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">Track performance by subject, CEFR level, and topic with trends, recommendations, and downloadable reports.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleGenerate} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Report setup</h3>

          <label className="block text-sm font-medium text-slate-700">
            Class name
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={className} onChange={(event) => setClassName(event.target.value)} required />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Student name
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={studentName} onChange={(event) => setStudentName(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Student ID
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={studentId} onChange={(event) => setStudentId(event.target.value)} required />
            </label>
          </div>

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
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60">
            {loading ? 'Generating analytics...' : 'Generate Analytics'}
          </button>
        </form>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Analytics output</h3>
          {!studentAnalytics || !classAnalytics ? (
            <p className="text-sm leading-7 text-slate-600">Generate analytics to see class insights, strengths, weaknesses, recommendations, and trend charts.</p>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{studentAnalytics.studentName}</p>
                <p className="mt-1">Year {studentAnalytics.yearLevel} • CEFR {studentAnalytics.cefrBand} • Overall score {studentAnalytics.overallScore}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => handleExport('pdf')} disabled={exporting} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60">
                  Download PDF
                </button>
                <button type="button" onClick={() => handleExport('docx')} disabled={exporting} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                  Download DOCX
                </button>
                <button type="button" onClick={() => handleExport('print')} disabled={exporting} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                  Print
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subject performance</p>
                {studentAnalytics.subjectPerformance.map((subject) => (
                  <article key={subject.subject} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold text-slate-900">{subject.subject} ({subject.cefrBand})</p>
                      <p className="text-slate-600">{subject.score}</p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-brand-primary" style={{ width: chartWidth(subject.score) }} />
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      {subject.topics.map((topic) => (
                        <li key={topic.topic}>{topic.topic}: {topic.score} ({topic.trendDelta >= 0 ? '+' : ''}{topic.trendDelta})</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-semibold">Strengths</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {studentAnalytics.strengths.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">Weaknesses</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {studentAnalytics.weaknesses.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Recommendations</p>
                <ul className="mt-2 list-inside list-decimal space-y-1">
                  {studentAnalytics.recommendations.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Class analytics: {classAnalytics.className}</p>
                <p className="mt-1 text-xs text-slate-600">{classAnalytics.studentCount} students • Average score {classAnalytics.averageScore}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">CEFR distribution</p>
                    {classAnalytics.cefrDistribution.map((item) => (
                      <p key={item.cefrBand}>{item.cefrBand}: {item.students}</p>
                    ))}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">At-risk students</p>
                    {classAnalytics.atRiskStudents.length === 0 ? <p>None</p> : classAnalytics.atRiskStudents.map((student) => <p key={student.studentId}>{student.studentName}: {student.overallScore}</p>)}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
