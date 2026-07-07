'use client';

import { FormEvent, useMemo, useState } from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type ReportStyle = 'formal' | 'encouraging' | 'concise';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

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

export default function ParentCommunicationReportingPage() {
  const [studentId, setStudentId] = useState('student-alyatan');
  const [studentName, setStudentName] = useState('Alya Tan');
  const [reportingPeriod, setReportingPeriod] = useState('Term 2, 2026');
  const [style, setStyle] = useState<ReportStyle>('encouraging');
  const [attendanceRate, setAttendanceRate] = useState(93);
  const [homeworkCompletionRate, setHomeworkCompletionRate] = useState(88);
  const [report, setReport] = useState<ParentProgressReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectScores = useMemo(
    () => [
      {
        subject: 'Reading',
        score: 81,
        cefrBand: 'A2' as CefrBand,
        topics: [
          { topic: 'Main idea', score: 84 },
          { topic: 'Inference', score: 76 },
          { topic: 'Vocabulary in context', score: 83 },
        ],
      },
      {
        subject: 'Writing',
        score: 74,
        cefrBand: 'A2' as CefrBand,
        topics: [
          { topic: 'Grammar', score: 70 },
          { topic: 'Organisation', score: 75 },
          { topic: 'Expression', score: 77 },
        ],
      },
      {
        subject: 'Spelling',
        score: 86,
        cefrBand: 'A2+' as CefrBand,
        topics: [
          { topic: 'Word families', score: 88 },
          { topic: 'Irregular words', score: 82 },
          { topic: 'Syllable patterns', score: 89 },
        ],
      },
    ],
    []
  );

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
          action: 'generate',
          student: {
            id: studentId,
            name: studentName,
            age: 10,
            currentLevel: 'intermediate' as Difficulty,
            masteryScore: subjectScores.reduce((sum, item) => sum + item.score, 0) / subjectScores.length,
            strengths: ['Consistent spelling retention', 'Confident oral reading'],
            weaknesses: ['Grammar consistency in long writing tasks'],
          },
          reportingPeriod,
          attendanceRate,
          homeworkCompletionRate,
          subjectScores,
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

  async function handleExport(type: 'pdf' | 'docx' | 'print') {
    if (!report) return;
    setExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-parent-communication-reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export',
          report,
        }),
      });

      const payload = (await response.json()) as { data?: ExportPayload; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to export parent report.');
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
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Parent Communication & Reporting</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Generate parent-friendly reports, letters, and meeting summaries</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">Build communication-ready updates with strengths, weaknesses, attendance, homework completion, and tailored recommendations.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleGenerate} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Report configuration</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Student ID
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={studentId} onChange={(event) => setStudentId(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Student name
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={studentName} onChange={(event) => setStudentName(event.target.value)} required />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Reporting period
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={reportingPeriod} onChange={(event) => setReportingPeriod(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Style
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={style} onChange={(event) => setStyle(event.target.value as ReportStyle)}>
                <option value="formal">Formal</option>
                <option value="encouraging">Encouraging</option>
                <option value="concise">Concise</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Attendance (%)
              <input type="number" min={0} max={100} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={attendanceRate} onChange={(event) => setAttendanceRate(Number(event.target.value))} />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Homework completion (%)
              <input type="number" min={0} max={100} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={homeworkCompletionRate} onChange={(event) => setHomeworkCompletionRate(Number(event.target.value))} />
            </label>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60">
            {loading ? 'Generating...' : 'Generate Parent Report'}
          </button>
        </form>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Generated communication pack</h3>
          {!report ? (
            <p className="text-sm leading-7 text-slate-600">Generate a report to review parent summary, personalized letter, meeting summary, and export options.</p>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{report.studentName}</p>
                <p className="mt-1">{report.reportingPeriod} • Style: {report.style}</p>
                <p className="mt-2">{report.summary}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => handleExport('pdf')} disabled={exporting} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60">Export PDF</button>
                <button type="button" onClick={() => handleExport('docx')} disabled={exporting} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Export DOCX</button>
                <button type="button" onClick={() => handleExport('print')} disabled={exporting} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Print</button>
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
                  <p className="font-semibold">Weaknesses</p>
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
                <p className="font-semibold text-slate-900">Learning recommendations</p>
                <ul className="mt-2 list-inside list-decimal space-y-1">
                  {report.learningRecommendations.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Personalized parent letter</p>
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
