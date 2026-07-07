'use client';

import { useMemo, useState } from 'react';

type RoleFilter = 'student' | 'teacher' | 'parent';
type ContentTypeFilter = 'quiz' | 'worksheet' | 'lesson';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface AdminDashboardAnalyticsReport {
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
  filters: {
    schoolIds: string[];
    roles: RoleFilter[];
    contentTypes: ContentTypeFilter[];
  };
  monitoring: {
    students: number;
    teachers: number;
    parents: number;
    schools: number;
    quizzes: number;
    worksheets: number;
    lessons: number;
  };
  activeUsers: {
    total: number;
    students: number;
    teachers: number;
    parents: number;
  };
  aiUsage: {
    totalRequests: number;
    byFeature: Array<{ feature: string; requests: number }>;
  };
  learningProgress: {
    averageMastery: number;
    completionRate: number;
    cefrDistribution: Array<{ cefrBand: CefrBand; students: number }>;
  };
  systemHealth: {
    uptimePercentage: number;
    averageLatencyMs: number;
    errorRatePercentage: number;
  };
  charts: {
    activeUsers: Array<{ label: string; value: number }>;
    aiRequests: Array<{ label: string; value: number }>;
    learningProgress: Array<{ label: string; value: number }>;
    systemHealth: Array<{ label: string; value: number }>;
  };
  insights: {
    executiveSummary: string;
    recommendations: string[];
  };
}

const SCHOOL_OPTIONS = ['school-alpha', 'school-bravo', 'school-charlie', 'school-delta'];

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function downloadBase64(base64: string, fileName: string, mimeType: string) {
  const url = `data:${mimeType};base64,${base64}`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
}

function ChartCard({
  title,
  points,
  colorClass,
  max,
}: {
  title: string;
  points: Array<{ label: string; value: number }>;
  colorClass: string;
  max: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-4 space-y-3">
        {points.map((point) => (
          <div key={`${title}-${point.label}`}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>{point.label}</span>
              <span>{point.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${colorClass}`}
                style={{ width: `${Math.max(4, Math.min(100, (point.value / Math.max(1, max)) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [fromDate, setFromDate] = useState(() => toDateInputValue(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)));
  const [toDate, setToDate] = useState(() => toDateInputValue(new Date()));
  const [schoolSelection, setSchoolSelection] = useState<string[]>(['school-alpha', 'school-bravo']);
  const [roleSelection, setRoleSelection] = useState<RoleFilter[]>(['student', 'teacher', 'parent']);
  const [contentSelection, setContentSelection] = useState<ContentTypeFilter[]>(['quiz', 'worksheet', 'lesson']);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState<null | 'csv' | 'pdf'>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AdminDashboardAnalyticsReport | null>(null);

  async function generateReport() {
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/ai-admin-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          dateRange: {
            from: new Date(`${fromDate}T00:00:00.000Z`).toISOString(),
            to: new Date(`${toDate}T23:59:59.000Z`).toISOString(),
          },
          filters: {
            schoolIds: schoolSelection,
            roles: roleSelection,
            contentTypes: contentSelection,
          },
        }),
      });

      const payload = (await response.json()) as { data?: AdminDashboardAnalyticsReport; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? 'Unable to generate analytics report.');
      }

      setReport(payload.data);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Unable to generate analytics report.');
    } finally {
      setSubmitting(false);
    }
  }

  async function exportReport(format: 'csv' | 'pdf') {
    if (!report) {
      setError('Generate a report before exporting.');
      return;
    }

    setError(null);
    setExporting(format);

    try {
      const response = await fetch('/api/ai-admin-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          format,
          report,
        }),
      });

      const payload = (await response.json()) as { data?: { fileName: string; mimeType: string; base64: string }; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? `Unable to export ${format.toUpperCase()} report.`);
      }

      downloadBase64(payload.data.base64, payload.data.fileName, payload.data.mimeType);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : `Unable to export ${format.toUpperCase()} report.`);
    } finally {
      setExporting(null);
    }
  }

  const chartLimits = useMemo(() => {
    if (!report) {
      return {
        activeUsers: 1,
        aiRequests: 1,
        learningProgress: 100,
        systemHealth: 100,
      };
    }

    return {
      activeUsers: Math.max(...report.charts.activeUsers.map((item) => item.value), 1),
      aiRequests: Math.max(...report.charts.aiRequests.map((item) => item.value), 1),
      learningProgress: 100,
      systemHealth: 100,
    };
  }, [report]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI admin dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">System-wide analytics and usage intelligence</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Monitor students, teachers, parents, schools, quizzes, worksheets, lessons, and AI usage with date-range reports, filtering, and one-click CSV or PDF export.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-accent/10 px-4 py-3 text-sm font-semibold text-brand-accent">Administrator only</div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-medium text-slate-700">
            From
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>

          <label className="text-sm font-medium text-slate-700">
            To
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Schools
            <select
              className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
              multiple
              value={schoolSelection}
              onChange={(event) => {
                const selected = Array.from(event.currentTarget.selectedOptions).map((option) => option.value);
                setSchoolSelection(selected);
              }}
            >
              {SCHOOL_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Roles
            <select
              className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
              multiple
              value={roleSelection}
              onChange={(event) => {
                const selected = Array.from(event.currentTarget.selectedOptions).map((option) => option.value as RoleFilter);
                setRoleSelection(selected);
              }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Content
            <select
              className="mt-1 h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
              multiple
              value={contentSelection}
              onChange={(event) => {
                const selected = Array.from(event.currentTarget.selectedOptions).map((option) => option.value as ContentTypeFilter);
                setContentSelection(selected);
              }}
            >
              <option value="quiz">Quiz</option>
              <option value="worksheet">Worksheet</option>
              <option value="lesson">Lesson</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={generateReport}
            disabled={submitting}
          >
            {submitting ? 'Generating report...' : 'Generate date-range report'}
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => exportReport('csv')}
            disabled={!report || exporting !== null}
          >
            {exporting === 'csv' ? 'Exporting CSV...' : 'Export CSV'}
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => exportReport('pdf')}
            disabled={!report || exporting !== null}
          >
            {exporting === 'pdf' ? 'Exporting PDF...' : 'Export PDF'}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </section>

      {report ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active users</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{report.activeUsers.total.toLocaleString()}</p>
              <p className="mt-1 text-sm text-slate-600">Students {report.activeUsers.students} | Teachers {report.activeUsers.teachers} | Parents {report.activeUsers.parents}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI requests</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{report.aiUsage.totalRequests.toLocaleString()}</p>
              <p className="mt-1 text-sm text-slate-600">System-wide usage in selected range</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Learning progress</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{report.learningProgress.averageMastery}%</p>
              <p className="mt-1 text-sm text-slate-600">Completion {report.learningProgress.completionRate}%</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">System health</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{report.systemHealth.uptimePercentage}%</p>
              <p className="mt-1 text-sm text-slate-600">Latency {report.systemHealth.averageLatencyMs}ms | Error {report.systemHealth.errorRatePercentage}%</p>
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Active Users Trend" points={report.charts.activeUsers} colorClass="bg-sky-500" max={chartLimits.activeUsers} />
            <ChartCard title="AI Requests Trend" points={report.charts.aiRequests} colorClass="bg-indigo-500" max={chartLimits.aiRequests} />
            <ChartCard title="Learning Progress Trend" points={report.charts.learningProgress} colorClass="bg-emerald-500" max={chartLimits.learningProgress} />
            <ChartCard title="System Health Trend" points={report.charts.systemHealth} colorClass="bg-amber-500" max={chartLimits.systemHealth} />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">System-wide monitoring</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700 md:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3">Students: {report.monitoring.students.toLocaleString()}</div>
                <div className="rounded-xl bg-slate-50 p-3">Teachers: {report.monitoring.teachers.toLocaleString()}</div>
                <div className="rounded-xl bg-slate-50 p-3">Parents: {report.monitoring.parents.toLocaleString()}</div>
                <div className="rounded-xl bg-slate-50 p-3">Schools: {report.monitoring.schools.toLocaleString()}</div>
                <div className="rounded-xl bg-slate-50 p-3">Quizzes: {report.monitoring.quizzes.toLocaleString()}</div>
                <div className="rounded-xl bg-slate-50 p-3">Worksheets: {report.monitoring.worksheets.toLocaleString()}</div>
                <div className="rounded-xl bg-slate-50 p-3">Lessons: {report.monitoring.lessons.toLocaleString()}</div>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI usage by feature</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {report.aiUsage.byFeature.map((item) => (
                  <li key={item.feature} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span>{item.feature}</span>
                    <span className="font-semibold">{item.requests.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI insights</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{report.insights.executiveSummary}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {report.insights.recommendations.map((item) => (
                  <li key={item} className="rounded-xl bg-slate-50 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
          Generate your first date-range report to view active users, AI requests, learning progress, and system health charts.
        </section>
      )}
    </main>
  );
}
