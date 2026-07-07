'use client';

import { FormEvent, useMemo, useState } from 'react';

interface TutorAssistantResult {
  sessionId: string;
  answer: string;
  followUpQuestion: string;
  keyTakeaways: string[];
  encouragement: string;
}

interface ChatItem {
  role: 'student' | 'assistant';
  text: string;
}

export default function AIStudentTutorPage() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [topic, setTopic] = useState('Spelling patterns - silent e');
  const [gradeLevel, setGradeLevel] = useState('Year 4');
  const [message, setMessage] = useState('Can you explain when to use silent e words?');
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [latestResult, setLatestResult] = useState<TutorAssistantResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => topic.trim().length > 0 && gradeLevel.trim().length > 0 && message.trim().length >= 2, [topic, gradeLevel, message]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const currentMessage = message.trim();
    setLoading(true);
    setError(null);
    setMessage('');
    setChat((previous) => [...previous, { role: 'student', text: currentMessage }]);

    try {
      const response = await fetch('/api/ai-student-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: currentMessage,
          topic,
          gradeLevel,
        }),
      });

      const payload = (await response.json()) as { data?: TutorAssistantResult; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to get tutor response.');
      }

      const tutorData = payload.data;
      setSessionId(tutorData.sessionId);
      setLatestResult(tutorData);
      setChat((previous) => [...previous, { role: 'assistant', text: tutorData.answer }]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unexpected tutor error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">AI Student Tutor</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Personalized learning chat</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Ask study questions and receive focused explanations, follow-up prompts, and key takeaways for your current topic.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Topic
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Grade level
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={gradeLevel}
                onChange={(event) => setGradeLevel(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Ask your question
              <textarea
                className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
            >
              {loading ? 'Thinking...' : 'Send to Tutor'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {chat.length === 0 ? (
              <p className="text-sm text-slate-600">Start a conversation to see your tutor chat history.</p>
            ) : (
              chat.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                    item.role === 'student' ? 'bg-slate-100 text-slate-700' : 'bg-brand-primary/10 text-slate-800'
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.role}</p>
                  {item.text}
                </div>
              ))
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Tutor guidance</h3>
          {!latestResult ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">Your follow-up prompt, key takeaways, and encouragement will appear here after your first message.</p>
          ) : (
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Follow-up Question</p>
                <p className="mt-2 text-sm text-slate-700">{latestResult.followUpQuestion || 'No follow-up question generated for this turn.'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Key Takeaways</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {latestResult.keyTakeaways.map((item) => (
                    <li key={item} className="rounded-xl bg-slate-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{latestResult.encouragement}</div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
