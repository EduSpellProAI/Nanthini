import { aiTelemetryService, geminiClient } from '@eduspell/ai-core';
import { FirestoreRepository } from '@eduspell/database';
import { createId } from '@eduspell/shared';
import { clamp, roundTo } from '@eduspell/shared';
import type { AIQuizGenerationRequest, QuizQuestion, QuizSession, SpellingChallengeRequest } from './models';

interface QuizStorageRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  payload: unknown;
  topicId: string;
  recordType: 'quiz' | 'spelling-challenge';
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid AI output field ${field}`);
  }
  return value.trim();
}

export class QuizEngineService {
  private readonly repository = new FirestoreRepository<QuizStorageRecord>('quizzes');

  createQuestion(prompt: string, type: QuizQuestion['type'], difficulty: QuizQuestion['difficulty']): QuizQuestion {
    return {
      id: `question-${Math.random().toString(36).slice(2, 8)}`,
      prompt,
      type,
      difficulty,
      options: type === 'multiple-choice' ? ['A', 'B', 'C', 'D'] : undefined,
      answer: 'answer',
      points: difficulty === 'advanced' ? 10 : difficulty === 'intermediate' ? 7 : 5,
    };
  }

  autoGrade(question: QuizQuestion, response: string): number {
    return response.trim().toLowerCase() === question.answer.toLowerCase() ? question.points : 0;
  }

  createTimedSession(topic: QuizSession['topic'], questions: QuizQuestion[], timeLimitSeconds = 600): QuizSession {
    return {
      id: `quiz-${Math.random().toString(36).slice(2, 8)}`,
      topic,
      questions,
      timeLimitSeconds,
      isTimed: true,
    };
  }

  calculateScore(questions: QuizQuestion[], responses: Record<string, string>): number {
    const total = questions.reduce((sum, question) => sum + question.points, 0);
    const earned = questions.reduce((sum, question) => sum + this.autoGrade(question, responses[question.id] ?? ''), 0);
    return roundTo((earned / total) * 100, 2);
  }

  getProgress(currentQuestionIndex: number, totalQuestions: number): number {
    return clamp((currentQuestionIndex / Math.max(totalQuestions, 1)) * 100, 0, 100);
  }

  async generateAiQuiz(request: AIQuizGenerationRequest): Promise<QuizSession> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-quiz-generator',
        systemPrompt:
          'Return strict JSON with field questions. Each question includes prompt, answer, options (optional array), and points. Ensure age-appropriate educational quality.',
        userPrompt: JSON.stringify(request),
        temperature: 0.35,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          if (!Array.isArray(source.questions) || source.questions.length === 0) {
            throw new Error('AI quiz generation requires a non-empty questions array.');
          }

          return source.questions.map((question, index) => {
            const item = question as Record<string, unknown>;
            const options = Array.isArray(item.options)
              ? item.options.map((option, optionIndex) => ensureString(option, `questions[${index}].options[${optionIndex}]`))
              : undefined;

            return {
              id: createId(`question-${index + 1}`),
              prompt: ensureString(item.prompt, `questions[${index}].prompt`),
              type: request.quizType,
              difficulty: request.difficulty,
              options,
              answer: ensureString(item.answer, `questions[${index}].answer`),
              points: Math.max(1, Number(item.points ?? (request.difficulty === 'advanced' ? 10 : 6))),
            } as QuizQuestion;
          });
        },
      }
    );

    const session: QuizSession = {
      id: createId('quiz'),
      topic: request.topic,
      questions: generated.data.slice(0, request.questionCount),
      timeLimitSeconds: Math.max(300, request.questionCount * 90),
      isTimed: true,
    };

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      payload: session,
      topicId: request.topic.id,
      recordType: 'quiz',
    });

    await aiTelemetryService.log({
      feature: 'ai-quiz-generator',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(session).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { topicId: request.topic.id, questionCount: session.questions.length },
    });

    return session;
  }

  async generateAiSpellingChallenge(request: SpellingChallengeRequest): Promise<QuizQuestion[]> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-spelling-challenge-generator',
        systemPrompt:
          'Return JSON with field words. Each item has word and hint. Hints must scaffold phonics and spelling memory.',
        userPrompt: JSON.stringify(request),
        temperature: 0.4,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          if (!Array.isArray(source.words) || source.words.length === 0) {
            throw new Error('Spelling challenge generation requires words array.');
          }

          return source.words.map((word, index) => {
            const item = word as Record<string, unknown>;
            const targetWord = ensureString(item.word, `words[${index}].word`);
            const hint = ensureString(item.hint, `words[${index}].hint`);

            return {
              id: createId(`spelling-${index + 1}`),
              prompt: request.includeSentenceHints ? `Spell: ${targetWord}. Hint: ${hint}` : `Spell: ${targetWord}`,
              type: 'spelling',
              difficulty: request.topic.difficulty,
              answer: targetWord,
              points: request.topic.difficulty === 'advanced' ? 8 : 5,
            } as QuizQuestion;
          });
        },
      }
    );

    const challenge = generated.data.slice(0, request.wordCount);
    const now = new Date().toISOString();

    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      payload: challenge,
      topicId: request.topic.id,
      recordType: 'spelling-challenge',
    });

    await aiTelemetryService.log({
      feature: 'ai-spelling-challenge-generator',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(challenge).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { topicId: request.topic.id, wordCount: challenge.length },
    });

    return challenge;
  }
}
