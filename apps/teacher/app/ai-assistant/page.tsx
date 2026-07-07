'use client';

import { FormEvent, useMemo, useState } from 'react';

interface TeacherAssistantResponse {
  summary: string;
  actionItems: string[];
  studentAlerts: string[];
  teacherQuestionAnswer: string;
  syllabusGuidance: string[];
  cefrGuidance: string[];
  lessonActivitySuggestions: string[];
  classroomManagementTips: string[];
  assessmentSupport: string[];
  differentiationStrategies: string[];
  teachingTips: string[];
  lessonImprovements: string[];
  recommendedWorksheets: string[];
  recommendedQuizzes: string[];
  recommendedHomework: string[];
}

function parseList(input: string): string[] {
  return input
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export default function AITeacherAssistantPage() {
  const [className, setClassName] = useState('Year 4 Cedar');
  const [activeStudents, setActiveStudents] = useState(28);
  const [lowPerformingStudentsInput, setLowPerformingStudentsInput] = useState('Mila R\nArun K\nNoah P');
  const [upcomingAssessmentsInput, setUpcomingAssessmentsInput] = useState('Spelling check - Friday\nReading fluency checkpoint - Monday');
  const [teacherQuestion, setTeacherQuestion] = useState('How can I improve Year 4 inference performance while differentiating for mixed ability learners?');
  const [syllabusReference, setSyllabusReference] = useState('KSSR English Year 4: Reading skill focus and CEFR A2 outcomes');
  const [language, setLanguage] = useState<'english' | 'bahasa_melayu' | 'tamil'>('english');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TeacherAssistantResponse | null>(null);

  const lowPerformingStudents = useMemo(() => parseList(lowPerformingStudentsInput), [lowPerformingStudentsInput]);
  const upcomingAssessments = useMemo(() => parseList(upcomingAssessmentsInput), [upcomingAssessmentsInput]);
  const studentPerformanceSnapshot = useMemo(
    () => [
      { topic: 'Reading inference', averageScore: 58, cefrBand: 'A2' as const },
      { topic: 'Sentence grammar', averageScore: 62, cefrBand: 'A1+' as const },
      { topic: 'Vocabulary in context', averageScore: 74, cefrBand: 'A2+' as const },
    ],
    []
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-teacher-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className,
          activeStudents,
          lowPerformingStudents,
          upcomingAssessments,
          teacherQuestion,
          syllabusReference,
          language,
          studentPerformanceSnapshot,
        }),
      });

      const payload = (await response.json()) as { data?: TeacherAssistantResponse; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to generate assistant insights.');
      }

      setResult(payload.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected AI assistant error.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Teacher Assistant</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Classroom planning and intervention support</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Ask curriculum-aligned questions and get multilingual copilot support for lesson planning, classroom management, assessment, differentiation, and auto resource recommendations.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Class context</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Class name
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Active students
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min={1}
                value={activeStudents}
                onChange={(event) => setActiveStudents(Number(event.target.value))}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Students needing support (one per line)
              <textarea
                className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={lowPerformingStudentsInput}
                onChange={(event) => setLowPerformingStudentsInput(event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Upcoming assessments (one per line)
              <textarea
                className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={upcomingAssessmentsInput}
                onChange={(event) => setUpcomingAssessmentsInput(event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Teacher question
              <textarea
                className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={teacherQuestion}
                onChange={(event) => setTeacherQuestion(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Syllabus / curriculum reference
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={syllabusReference}
                onChange={(event) => setSyllabusReference(event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Response language
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={language} onChange={(event) => setLanguage(event.target.value as 'english' | 'bahasa_melayu' | 'tamil')}>
                <option value="english">English</option>
                <option value="bahasa_melayu">Bahasa Melayu</option>
                <option value="tamil">Tamil</option>
              </select>
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {submitting ? 'Generating...' : 'Generate AI Insights'}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Assistant output</h3>

          {!result ? (
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Submit class details to get intervention priorities, practical actions, and student risk alerts tailored to this class.
            </p>
          ) : (
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Summary</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{result.summary}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Answer To Teacher Question</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{result.teacherQuestionAnswer}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Action Items</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.actionItems.map((item) => (
                    <li key={item} className="rounded-xl bg-slate-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Syllabus And CEFR Guidance</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {[...result.syllabusGuidance, ...result.cefrGuidance].map((item) => (
                    <li key={item} className="rounded-xl bg-indigo-50 px-3 py-2 text-indigo-900">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Lesson Activities And Differentiation</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {[...result.lessonActivitySuggestions, ...result.differentiationStrategies].map((item) => (
                    <li key={item} className="rounded-xl bg-slate-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Classroom Management And Teaching Tips</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {[...result.classroomManagementTips, ...result.teachingTips].map((item) => (
                    <li key={item} className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assessment Support And Lesson Improvements</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {[...result.assessmentSupport, ...result.lessonImprovements].map((item) => (
                    <li key={item} className="rounded-xl bg-violet-50 px-3 py-2 text-violet-900">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Auto Recommendations: Worksheets, Quizzes, Homework</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {[...result.recommendedWorksheets, ...result.recommendedQuizzes, ...result.recommendedHomework].map((item) => (
                    <li key={item} className="rounded-xl bg-brand-primary/10 px-3 py-2 text-brand-primary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Student Alerts</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.studentAlerts.length === 0 ? (
                    <li className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">No critical alerts for this snapshot.</li>
                  ) : (
                    result.studentAlerts.map((item) => (
                      <li key={item} className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
                        {item}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
