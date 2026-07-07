'use client';

import { FormEvent, useMemo, useState } from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface WorksheetItem {
  id: string;
  prompt: string;
  answer: string;
}

interface WorksheetResult {
  yearLevel: number;
  cefrBand: CefrBand;
  items: WorksheetItem[];
  includeAnswerKey: boolean;
  fileName: string;
  pdfBase64: string;
}

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

export default function WorksheetGeneratorPage() {
  const [topicName, setTopicName] = useState('Reading comprehension: characters and settings');
  const [topicCategory, setTopicCategory] = useState('Reading');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [yearLevel, setYearLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(4);
  const [objectiveTitle, setObjectiveTitle] = useState('Identify key story details using evidence from text');
  const [objectiveDescription, setObjectiveDescription] = useState('Students identify character actions and setting clues in short passages.');
  const [questionCount, setQuestionCount] = useState(8);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorksheetResult | null>(null);

  const cefrBand = useMemo(() => mapYearToCefr(yearLevel), [yearLevel]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-worksheet-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName,
          topicCategory,
          difficulty,
          yearLevel,
          objectiveTitle,
          objectiveDescription,
          questionCount,
          includeAnswerKey,
        }),
      });

      const payload = (await response.json()) as { data?: WorksheetResult; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate worksheet.');
      }

      setResult(payload.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected worksheet generation error.');
    } finally {
      setLoading(false);
    }
  }

  function toPdfBlob(base64: string): Blob {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i += 1) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
  }

  function handleExportPdf() {
    if (!result) return;
    const blob = toPdfBlob(result.pdfBase64);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handlePrintPdf() {
    if (!result) return;
    const blob = toPdfBlob(result.pdfBase64);
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Worksheet Generator</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Printable CEFR worksheet builder (Year 1-6)</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Generate printable PDF worksheets with answer key, aligned to CEFR progression and primary year-level expectations.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Worksheet setup</h3>

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

            <label className="block text-sm font-medium text-slate-700">
              Objective title
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={objectiveTitle} onChange={(event) => setObjectiveTitle(event.target.value)} required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Objective description
              <textarea className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2" value={objectiveDescription} onChange={(event) => setObjectiveDescription(event.target.value)} required />
            </label>

            <div className="grid gap-4 md:grid-cols-2 md:items-end">
              <label className="block text-sm font-medium text-slate-700">
                Question count
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="number"
                  min={4}
                  max={24}
                  value={questionCount}
                  onChange={(event) => setQuestionCount(Number(event.target.value))}
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={includeAnswerKey} onChange={(event) => setIncludeAnswerKey(event.target.checked)} />
                Include answer key
              </label>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Worksheet PDF'}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Worksheet output</h3>

          {!result ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">Generate a worksheet to review questions, answer key status, and export printable PDF.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Year {result.yearLevel} • CEFR {result.cefrBand}</p>
                <p className="mt-1">{result.items.length} questions • Answer key {result.includeAnswerKey ? 'included' : 'excluded'}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleExportPdf} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90">
                  Export PDF
                </button>
                <button type="button" onClick={handlePrintPdf} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Print
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Questions preview</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {result.items.map((item, index) => (
                    <li key={item.id} className="rounded-xl border border-slate-200 px-3 py-2">
                      <p className="font-medium text-slate-900">{index + 1}. {item.prompt}</p>
                      {result.includeAnswerKey ? <p className="mt-1 text-xs text-slate-500">Answer: {item.answer}</p> : null}
                    </li>
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
