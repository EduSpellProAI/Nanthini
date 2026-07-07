'use client';

import { FormEvent, useMemo, useState } from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
type ExamSectionType = 'objective' | 'subjective' | 'comprehension' | 'vocabulary' | 'grammar' | 'writing';

interface ExamQuestion {
  id: string;
  prompt: string;
  marks: number;
  answerScheme: string;
  markingGuide: string[];
}

interface ExamSection {
  id: string;
  type: ExamSectionType;
  title: string;
  instructions: string;
  marks: number;
  questions: ExamQuestion[];
}

interface ExamPaper {
  id: string;
  title: string;
  yearLevel: number;
  cefrBand: CefrBand;
  difficulty: Difficulty;
  durationMinutes: number;
  totalMarks: number;
  sections: ExamSection[];
  answerScheme: string[];
  markingGuide: string[];
}

interface ExamResponseData {
  examPaper: ExamPaper;
  pdfBase64: string;
  docxBase64: string;
  pdfFileName: string;
  docxFileName: string;
}

const allSections: ExamSectionType[] = ['objective', 'subjective', 'comprehension', 'vocabulary', 'grammar', 'writing'];

function mapYearToCefr(yearLevel: number): CefrBand {
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

function fromBase64(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);

  for (let i = 0; i < byteChars.length; i += 1) {
    bytes[i] = byteChars.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

function titleCase(value: string): string {
  return value
    .split('-')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
}

export default function ExamPaperGeneratorPage() {
  const [topicName, setTopicName] = useState('Mid-term English assessment: reading and writing skills');
  const [topicCategory, setTopicCategory] = useState('English Assessment');
  const [yearLevel, setYearLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [durationMinutes, setDurationMinutes] = useState(75);
  const [totalMarks, setTotalMarks] = useState(80);
  const [selectedSections, setSelectedSections] = useState<ExamSectionType[]>([...allSections]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExamResponseData | null>(null);

  const cefrBand = useMemo(() => mapYearToCefr(yearLevel), [yearLevel]);

  function toggleSection(section: ExamSectionType) {
    setSelectedSections((current) => {
      if (current.includes(section)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== section);
      }

      return [...current, section];
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-exam-paper-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName,
          topicCategory,
          yearLevel,
          difficulty,
          durationMinutes,
          totalMarks,
          sections: selectedSections,
        }),
      });

      const payload = (await response.json()) as { data?: ExamResponseData; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate exam paper.');
      }

      setResult(payload.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected exam generation error.');
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    if (!result) return;
    const blob = fromBase64(result.pdfBase64, 'application/pdf');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.pdfFileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadDocx() {
    if (!result) return;
    const blob = fromBase64(result.docxBase64, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.docxFileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printPaper() {
    if (!result) return;
    const blob = fromBase64(result.pdfBase64, 'application/pdf');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Exam Paper Generator</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Complete CEFR exam papers for Year 1-6</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Build full exam papers with objective, subjective, comprehension, vocabulary, grammar, and writing sections including answer scheme and marking guide.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Exam setup</h3>

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
                <p className="mt-1 text-xs text-slate-500">CEFR band: {cefrBand}</p>
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Duration (minutes)
                <input
                  type="number"
                  min={30}
                  max={180}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(Number(event.target.value))}
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Total marks
                <input
                  type="number"
                  min={20}
                  max={200}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={totalMarks}
                  onChange={(event) => setTotalMarks(Number(event.target.value))}
                />
              </label>
            </div>

            <fieldset className="rounded-xl border border-slate-200 p-3">
              <legend className="px-2 text-sm font-medium text-slate-700">Exam sections</legend>
              <div className="mt-1 grid gap-2 md:grid-cols-2">
                {allSections.map((section) => (
                  <label key={section} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700">
                    <input type="checkbox" checked={selectedSections.includes(section)} onChange={() => toggleSection(section)} />
                    {titleCase(section)}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Exam Paper'}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Exam output</h3>

          {!result ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">Generate an exam to review sections, answer scheme, and marking guide with export options.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{result.examPaper.title}</p>
                <p className="mt-1">
                  Year {result.examPaper.yearLevel} • CEFR {result.examPaper.cefrBand} • {result.examPaper.durationMinutes} minutes • {result.examPaper.totalMarks} marks
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={downloadPdf} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90">
                  Export PDF
                </button>
                <button type="button" onClick={downloadDocx} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Export DOCX
                </button>
                <button type="button" onClick={printPaper} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Print
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Exam sections</p>
                {result.examPaper.sections.map((section) => (
                  <article key={section.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">
                      {section.title} ({titleCase(section.type)}) - {section.marks} marks
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{section.instructions}</p>
                    <ul className="mt-2 space-y-1">
                      {section.questions.map((question, index) => (
                        <li key={question.id} className="rounded-lg bg-slate-50 px-2 py-1.5">
                          {index + 1}. {question.prompt} [{question.marks} marks]
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Answer scheme</p>
                <ul className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-700">
                  {result.examPaper.answerScheme.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Marking guide</p>
                <ul className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-700">
                  {result.examPaper.markingGuide.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
