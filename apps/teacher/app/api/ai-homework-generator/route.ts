import { LessonEngineService } from '@eduspell/lesson-engine';
import { NextRequest, NextResponse } from 'next/server';

interface HomeworkPayload {
  topicName: string;
  topicCategory: string;
  topicDifficulty: 'beginner' | 'intermediate' | 'advanced';
  objectiveTitle: string;
  objectiveDescription: string;
  objectiveDifficulty: 'beginner' | 'intermediate' | 'advanced';
  dueDate: string;
  estimatedMinutes: number;
  parentSupportTips: boolean;
}

function ensureDifficulty(value: string, field: string): 'beginner' | 'intermediate' | 'advanced' {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  throw new Error(`${field} must be one of: beginner, intermediate, advanced.`);
}

function parsePayload(value: unknown): HomeworkPayload {
  const source = value as Record<string, unknown>;

  const topicName = String(source.topicName ?? '').trim();
  const topicCategory = String(source.topicCategory ?? '').trim();
  const objectiveTitle = String(source.objectiveTitle ?? '').trim();
  const objectiveDescription = String(source.objectiveDescription ?? '').trim();
  const dueDate = String(source.dueDate ?? '').trim();

  if (!topicName) throw new Error('topicName is required.');
  if (!topicCategory) throw new Error('topicCategory is required.');
  if (!objectiveTitle) throw new Error('objectiveTitle is required.');
  if (!objectiveDescription) throw new Error('objectiveDescription is required.');
  if (!dueDate) throw new Error('dueDate is required.');

  const estimatedMinutes = Number(source.estimatedMinutes);
  if (!Number.isFinite(estimatedMinutes) || estimatedMinutes < 5 || estimatedMinutes > 180) {
    throw new Error('estimatedMinutes must be a number between 5 and 180.');
  }

  return {
    topicName,
    topicCategory,
    topicDifficulty: ensureDifficulty(String(source.topicDifficulty ?? ''), 'topicDifficulty'),
    objectiveTitle,
    objectiveDescription,
    objectiveDifficulty: ensureDifficulty(String(source.objectiveDifficulty ?? ''), 'objectiveDifficulty'),
    dueDate,
    estimatedMinutes,
    parentSupportTips: Boolean(source.parentSupportTips),
  };
}

export async function POST(request: NextRequest) {
  try {
    const role = request.cookies.get('eduspell_role')?.value;
    if (role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can access this endpoint.' }, { status: 403 });
    }

    const payload = parsePayload(await request.json());
    const lessonEngine = new LessonEngineService();

    const homework = await lessonEngine.generateAiHomework({
      topic: {
        id: `topic-${payload.topicName.toLowerCase().replace(/\s+/g, '-')}`,
        name: payload.topicName,
        category: payload.topicCategory,
        difficulty: payload.topicDifficulty,
      },
      objective: {
        id: `objective-${payload.objectiveTitle.toLowerCase().replace(/\s+/g, '-')}`,
        title: payload.objectiveTitle,
        description: payload.objectiveDescription,
        difficulty: payload.objectiveDifficulty,
      },
      dueDate: payload.dueDate,
      estimatedMinutes: payload.estimatedMinutes,
      parentSupportTips: payload.parentSupportTips,
    });

    return NextResponse.json({ data: homework });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate AI homework.',
      },
      { status: 400 }
    );
  }
}
