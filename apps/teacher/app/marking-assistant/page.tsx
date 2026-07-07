'use client';

import { FormEvent, useMemo, useState } from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
type MarkingQuestionType = 'objective' | 'subjective' | 'comprehension' | 'essay' | 'writing';

interface MarkingQuestionInput {
  id: string;
  type: MarkingQuestionType;
  prompt: string;
  marks: number;
}

interface AnswerSchemeItem {
  questionId: string;
  type: MarkingQuestionType;
  prompt: string;
  marks: number;
  suggestedAnswer: string;
  rubric: string[];
  markingGuide: string[];
}

interface MarkingAssistantResult {
  id: string;
  title: string;
  yearLevel: number;
  cefrBand: CefrBand;
  difficulty: Difficulty;
  totalMarks: number;
  items: AnswerSchemeItem[];
  rubric: string[];
  markingGuide: string[];
}

interface ExportPayload {
  pdfBase64: string;
  docxBase64: string;
  pdfFileName: string;
  docxFileName: string;
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

function toBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i += 1) {
    array[i] = bytes.charCodeAt(i);
  }

  return new Blob([array], { type: mimeType });
}

const questionTypeOptions: MarkingQuestionType[] = ['objective', 'subjective', 'comprehension', 'essay', 'writing'];

export default function MarkingAssistantPage() {
  const [title, setTitle] = useState('Unit Assessment Marking Pack');
  const [topicName, setTopicName] = useState('Narrative writing and reading comprehension');
  const [topicCategory, setTopicCategory] = useState('English Assessment');
  const [yearLevel, setYearLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(4);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [questions, setQuestions] = useState<MarkingQuestionInput[]>([
    { id: 'q1', type: 'objective', prompt: 'Choose the correct synonym for the word "brave".', marks: 2 },
    { id: 'q2', type: 'comprehension', prompt: 'Explain why Amir decided to help his friend in the story.', marks: 4 },
    { id: 'q3', type: 'essay', prompt: 'Write a short essay about a time you learned from a mistake.', marks: 10 },
  ]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarkingAssistantResult | null>(null);

  const cefrBand = useMemo(() => mapYearToCefr(yearLevel), [yearLevel]);

  function updateQuestion(index: number, changes: Partial<MarkingQuestionInput>) {
    setQuestions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item)));
  }

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      { id: `q${current.length + 1}`, type: 'subjective', prompt: '', marks: 3 },
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateItem(index: number, changes: Partial<AnswerSchemeItem>) {
    setResult((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item)),
      };
    });
  }

  function updateItemLines(index: number, field: 'rubric' | 'markingGuide', rawText: string) {
    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setResult((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: lines } : item)),
      };
    });
  }

  function updateOverallLines(field: 'rubric' | 'markingGuide', rawText: string) {
    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setResult((current) => {
      if (!current) return current;
      return {
        ...current,
        [field]: lines,
      };
    });
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-marking-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          title,
          topicName,
          topicCategory,
          yearLevel,
          difficulty,
          questions,
        }),
      });

      const payload = (await response.json()) as { data?: MarkingAssistantResult; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate answer scheme.');
      }

      setResult(payload.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected generation error.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format: 'pdf' | 'docx' | 'print') {
    if (!result) return;
    setExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-marking-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          result,
        }),
      });

      const payload = (await response.json()) as { data?: ExportPayload; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to export files.');
      }

      if (format === 'pdf') {
        const blob = toBlob(payload.data.pdfBase64, 'application/pdf');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = payload.data.pdfFileName;
        link.click();
        URL.revokeObjectURL(url);
      }

      if (format === 'docx') {
        const blob = toBlob(payload.data.docxBase64, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = payload.data.docxFileName;
        link.click();
        URL.revokeObjectURL(url);
      }

      if (format === 'print') {
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
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Answer Scheme & Marking Assistant</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Generate, edit, and export marking packs</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Build complete answer schemes with rubrics and marking guides for objective, subjective, comprehension, essay, and writing questions.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleGenerate} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Assessment input</h3>

          <label className="block text-sm font-medium text-slate-700">
            Marking pack title
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Topic
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={topicName} onChange={(event) => setTopicName(event.target.value)} required />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Category
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

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Questions</p>
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                  <select className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={question.type} onChange={(event) => updateQuestion(index, { type: event.target.value as MarkingQuestionType })}>
                    {questionTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input type="number" min={1} max={30} className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={question.marks} onChange={(event) => updateQuestion(index, { marks: Number(event.target.value) })} />
                  <button type="button" onClick={() => removeQuestion(index)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-600">Remove</button>
                </div>
                <textarea className="min-h-20 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={question.prompt} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} required />
              </div>
            ))}

            <button type="button" onClick={addQuestion} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Add Question</button>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60">
            {loading ? 'Generating...' : 'Generate Answer Scheme'}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Editable scheme output</h3>

          {!result ? (
            <p className="text-sm leading-7 text-slate-600">Generate an answer scheme to edit answers, rubrics, and marking guides before exporting.</p>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{result.title}</p>
                <p className="mt-1">Year {result.yearLevel} • CEFR {result.cefrBand} • Total marks {result.totalMarks}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => handleExport('pdf')} disabled={exporting} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:opacity-60">Export PDF</button>
                <button type="button" onClick={() => handleExport('docx')} disabled={exporting} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Export DOCX</button>
                <button type="button" onClick={() => handleExport('print')} disabled={exporting} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Print</button>
              </div>

              <div className="space-y-4 max-h-[62vh] overflow-auto pr-1">
                {result.items.map((item, index) => (
                  <article key={item.questionId} className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <p className="text-sm font-semibold text-slate-900">Q{index + 1} ({item.type}) - {item.marks} marks</p>
                    <p className="text-sm text-slate-700">{item.prompt}</p>

                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Suggested answer
                      <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-slate-700" value={item.suggestedAnswer} onChange={(event) => updateItem(index, { suggestedAnswer: event.target.value })} />
                    </label>

                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Rubric (one line per point)
                      <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-slate-700" value={item.rubric.join('\n')} onChange={(event) => updateItemLines(index, 'rubric', event.target.value)} />
                    </label>

                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Marking guide (one line per point)
                      <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-slate-700" value={item.markingGuide.join('\n')} onChange={(event) => updateItemLines(index, 'markingGuide', event.target.value)} />
                    </label>
                  </article>
                ))}

                <div className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Overall rubric (one line per point)
                    <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-slate-700" value={result.rubric.join('\n')} onChange={(event) => updateOverallLines('rubric', event.target.value)} />
                  </label>

                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Overall marking guide (one line per point)
                    <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-normal normal-case tracking-normal text-slate-700" value={result.markingGuide.join('\n')} onChange={(event) => updateOverallLines('markingGuide', event.target.value)} />
                  </label>
                </div>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
