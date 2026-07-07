import { AnalyticsService } from '@eduspell/analytics';
import { NextRequest, NextResponse } from 'next/server';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface ParentSummaryPayload {
  student: {
    id: string;
    name: string;
    age: number;
    currentLevel: Difficulty;
    masteryScore: number;
    strengths: string[];
    weaknesses: string[];
  };
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  recentScores: number[];
}

function ensureDifficulty(value: string): Difficulty {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  throw new Error('student.currentLevel must be beginner, intermediate, or advanced.');
}

function parsePayload(value: unknown): ParentSummaryPayload {
  const source = value as Record<string, unknown>;
  const studentSource = (source.student ?? {}) as Record<string, unknown>;

  const id = String(studentSource.id ?? '').trim();
  const name = String(studentSource.name ?? '').trim();
  const age = Number(studentSource.age);
  const masteryScore = Number(studentSource.masteryScore);

  if (!id || !name) throw new Error('student id and name are required.');
  if (!Number.isInteger(age) || age < 5 || age > 18) throw new Error('student.age must be between 5 and 18.');
  if (!Number.isFinite(masteryScore) || masteryScore < 0 || masteryScore > 100) throw new Error('student.masteryScore must be between 0 and 100.');

  const yearLevel = Number(source.yearLevel);
  if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 6) {
    throw new Error('yearLevel must be between 1 and 6.');
  }

  const strengths = Array.isArray(studentSource.strengths)
    ? studentSource.strengths.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const weaknesses = Array.isArray(studentSource.weaknesses)
    ? studentSource.weaknesses.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const recentScores = Array.isArray(source.recentScores)
    ? source.recentScores.map((item) => Number(item)).filter((item) => Number.isFinite(item))
    : [];

  if (recentScores.length === 0) {
    throw new Error('recentScores must contain at least one value.');
  }

  return {
    student: {
      id,
      name,
      age,
      currentLevel: ensureDifficulty(String(studentSource.currentLevel ?? '')),
      masteryScore,
      strengths,
      weaknesses,
    },
    yearLevel: yearLevel as 1 | 2 | 3 | 4 | 5 | 6,
    recentScores,
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = parsePayload(await request.json());
    const analytics = new AnalyticsService();

    const summary = await analytics.generateParentProgressSummary({
      student: payload.student,
      yearLevel: payload.yearLevel,
      recentScores: payload.recentScores,
      strengths: payload.student.strengths,
      weaknesses: payload.student.weaknesses,
    });

    return NextResponse.json({ data: summary });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate parent progress summary.',
      },
      { status: 400 }
    );
  }
}
