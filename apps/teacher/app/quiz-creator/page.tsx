'use client';

import { FormEvent, useState } from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type QuizType = 'multiple-choice' | 'drag-drop' | 'matching' | 'fill-blank' | 'spelling' | 'timed';

interface QuizQuestion {
  id: string;
  prompt: string;
  type: QuizType;
  difficulty: Difficulty;
  options?: string[];
  answer: string;
  points: number;
}

interface QuizSession {
  id: string;
  topic: {
    id: string;
    name: string;
    category: string;
    difficulty: Difficulty;
  };
  questions: QuizQuestion[];
  timeLimitSeconds: number;
  isTimed: boolean;
}

export default function QuizCreatorPage() {
  const [topicName, setTopicName] = useState('Word families');
  const [topicCategory, setTopicCategory] = useState('Spelling');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [quizType, setQuizType] = useState<QuizType>('multiple-choice');
  const [questionCount, setQuestionCount] = useState(6);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizSession | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-quiz-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName,
          topicCategory,
          difficulty,
          quizType,
          questionCount,
        }),
      });

      const payload = (await response.json()) as { data?: QuizSession; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Unable to generate quiz.');
      }

      setResult(payload.data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected quiz generation error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">AI Quiz Generator</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Generate high-quality quizzes with structured questions, answer keys, and timed session support aligned to class difficulty.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Quiz setup</h3>

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
                Difficulty
                <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Quiz type
                <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={quizType} onChange={(event) => setQuizType(event.target.value as QuizType)}>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="drag-drop">Drag and Drop</option>
                  <option value="matching">Matching</option>
                  <option value="fill-blank">Fill in the Blank</option>
                  <option value="spelling">Spelling</option>
                  <option value="timed">Timed</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Question count
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min={3}
                max={20}
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value))}
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Generated quiz</h3>

          {!result ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">Generate a quiz to review question quality, expected answers, and timing.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{result.topic.name}</p>
                <p className="mt-1">{result.questions.length} questions • {Math.round(result.timeLimitSeconds / 60)} minutes</p>
              </div>

              <div className="space-y-3">
                {result.questions.map((question, index) => (
                  <article key={question.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question {index + 1}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{question.prompt}</p>

                    {question.options?.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {question.options.map((option) => (
                          <li key={`${question.id}-${option}`}>{option}</li>
                        ))}
                      </ul>
                    ) : null}

                    <p className="mt-3 text-xs text-slate-500">Answer key: {question.answer}</p>
                    <p className="text-xs text-slate-500">Points: {question.points}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
