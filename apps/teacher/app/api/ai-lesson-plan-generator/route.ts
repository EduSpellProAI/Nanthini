import { LessonEngineService } from '@eduspell/lesson-engine';
import { NextRequest, NextResponse } from 'next/server';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

type LessonPayload = {
  topicName: string;
  topicCategory: string;
  difficulty: Difficulty;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  durationMinutes: number;
  objectiveTitles: string[];
  studentNeeds: string[];
};

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
      throw new Error('yearLevel must be between 1 and 6.');
  }
}

function ensureDifficulty(value: string): Difficulty {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  throw new Error('difficulty must be one of: beginner, intermediate, advanced.');
}

function parsePayload(value: unknown): LessonPayload {
  const source = value as Record<string, unknown>;
  const topicName = String(source.topicName ?? '').trim();
  const topicCategory = String(source.topicCategory ?? '').trim();

  if (!topicName) throw new Error('topicName is required.');
  if (!topicCategory) throw new Error('topicCategory is required.');

  const yearLevel = Number(source.yearLevel);
  if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 6) {
    throw new Error('yearLevel must be an integer between 1 and 6.');
  }

  const durationMinutes = Number(source.durationMinutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes < 20 || durationMinutes > 120) {
    throw new Error('durationMinutes must be between 20 and 120.');
  }

  const objectiveTitles = Array.isArray(source.objectiveTitles)
    ? source.objectiveTitles.map((item) => String(item).trim()).filter((item) => item.length > 0)
    : [];

  if (objectiveTitles.length === 0) {
    throw new Error('At least one learning objective is required.');
  }

  const studentNeeds = Array.isArray(source.studentNeeds)
    ? source.studentNeeds.map((item) => String(item).trim()).filter((item) => item.length > 0)
    : [];

  return {
    topicName,
    topicCategory,
    difficulty: ensureDifficulty(String(source.difficulty ?? '')),
    yearLevel: yearLevel as 1 | 2 | 3 | 4 | 5 | 6,
    durationMinutes,
    objectiveTitles,
    studentNeeds,
  };
}

export async function POST(request: NextRequest) {
  try {
    const role = request.cookies.get('eduspell_role')?.value;
    if (role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can access this endpoint.' }, { status: 403 });
    }

    const payload = parsePayload(await request.json());
    const cefrBand = mapYearToCefr(payload.yearLevel);

    const lessonEngine = new LessonEngineService();
    const lesson = await lessonEngine.generateAiLesson({
      topic: {
        id: `topic-${payload.topicName.toLowerCase().replace(/\s+/g, '-')}`,
        name: payload.topicName,
        category: payload.topicCategory,
        difficulty: payload.difficulty,
      },
      objectives: payload.objectiveTitles.map((title, index) => ({
        id: `objective-${index + 1}`,
        title,
        description: `Learners can demonstrate ${title.toLowerCase()} in guided and independent tasks.`,
        difficulty: payload.difficulty,
      })),
      classGrade: `Year ${payload.yearLevel}`,
      yearLevel: payload.yearLevel,
      cefrBand,
      durationMinutes: payload.durationMinutes,
      studentNeeds: payload.studentNeeds,
    });

    return NextResponse.json({ data: lesson });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate AI lesson plan.',
      },
      { status: 400 }
    );
  }
}
