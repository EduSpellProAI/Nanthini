import { QuizEngineService } from '@eduspell/quiz-engine';
import { NextRequest, NextResponse } from 'next/server';

interface QuizPayload {
  topicName: string;
  topicCategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  quizType: 'multiple-choice' | 'drag-drop' | 'matching' | 'fill-blank' | 'spelling' | 'timed';
}

function ensureDifficulty(value: string): QuizPayload['difficulty'] {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  throw new Error('difficulty must be one of: beginner, intermediate, advanced.');
}

function ensureQuizType(value: string): QuizPayload['quizType'] {
  if (value === 'multiple-choice' || value === 'drag-drop' || value === 'matching' || value === 'fill-blank' || value === 'spelling' || value === 'timed') {
    return value;
  }

  throw new Error('quizType is invalid.');
}

function parsePayload(value: unknown): QuizPayload {
  const source = value as Record<string, unknown>;
  const topicName = String(source.topicName ?? '').trim();
  const topicCategory = String(source.topicCategory ?? '').trim();

  if (!topicName) throw new Error('topicName is required.');
  if (!topicCategory) throw new Error('topicCategory is required.');

  const questionCount = Number(source.questionCount);
  if (!Number.isFinite(questionCount) || questionCount < 3 || questionCount > 20) {
    throw new Error('questionCount must be between 3 and 20.');
  }

  return {
    topicName,
    topicCategory,
    difficulty: ensureDifficulty(String(source.difficulty ?? '')),
    questionCount,
    quizType: ensureQuizType(String(source.quizType ?? '')),
  };
}

export async function POST(request: NextRequest) {
  try {
    const role = request.cookies.get('eduspell_role')?.value;
    if (role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can access this endpoint.' }, { status: 403 });
    }

    const payload = parsePayload(await request.json());
    const quizEngine = new QuizEngineService();

    const quiz = await quizEngine.generateAiQuiz({
      topic: {
        id: `topic-${payload.topicName.toLowerCase().replace(/\s+/g, '-')}`,
        name: payload.topicName,
        category: payload.topicCategory,
        difficulty: payload.difficulty,
      },
      difficulty: payload.difficulty,
      questionCount: payload.questionCount,
      quizType: payload.quizType,
    });

    return NextResponse.json({ data: quiz });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate AI quiz.',
      },
      { status: 400 }
    );
  }
}
