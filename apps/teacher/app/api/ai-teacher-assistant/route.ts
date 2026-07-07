import { AnalyticsService } from '@eduspell/analytics';
import { NextRequest, NextResponse } from 'next/server';

interface AssistantPayload {
  className: string;
  activeStudents: number;
  lowPerformingStudents: string[];
  upcomingAssessments: string[];
  teacherQuestion: string;
  syllabusReference?: string;
  language: 'english' | 'bahasa_melayu' | 'tamil';
  studentPerformanceSnapshot: Array<{
    topic: string;
    averageScore: number;
    cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  }>;
}

function ensureLanguage(value: string): AssistantPayload['language'] {
  if (value === 'english' || value === 'bahasa_melayu' || value === 'tamil') {
    return value;
  }

  throw new Error('language must be english, bahasa_melayu, or tamil.');
}

function ensureCefrBand(value: string): 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' {
  if (value === 'Pre-A1' || value === 'A1' || value === 'A1+' || value === 'A2' || value === 'A2+' || value === 'B1') {
    return value;
  }

  throw new Error(`Invalid CEFR band: ${value}`);
}

function parsePayload(value: unknown): AssistantPayload {
  const source = value as Record<string, unknown>;

  const className = String(source.className ?? '').trim();
  if (!className) {
    throw new Error('className is required.');
  }

  const activeStudents = Number(source.activeStudents);
  if (!Number.isFinite(activeStudents) || activeStudents <= 0) {
    throw new Error('activeStudents must be a positive number.');
  }

  const lowPerformingStudents = Array.isArray(source.lowPerformingStudents)
    ? source.lowPerformingStudents.map((item) => String(item).trim()).filter((item) => item.length > 0)
    : [];

  const upcomingAssessments = Array.isArray(source.upcomingAssessments)
    ? source.upcomingAssessments.map((item) => String(item).trim()).filter((item) => item.length > 0)
    : [];

  const teacherQuestion = String(source.teacherQuestion ?? '').trim();
  if (!teacherQuestion) {
    throw new Error('teacherQuestion is required.');
  }

  const syllabusReference = String(source.syllabusReference ?? '').trim();

  const studentPerformanceSnapshot = Array.isArray(source.studentPerformanceSnapshot)
    ? source.studentPerformanceSnapshot.map((item, index) => {
        const current = item as Record<string, unknown>;
        const topic = String(current.topic ?? '').trim();
        const averageScore = Number(current.averageScore);
        const cefrBand = ensureCefrBand(String(current.cefrBand ?? ''));

        if (!topic) {
          throw new Error(`studentPerformanceSnapshot[${index}].topic is required.`);
        }

        if (!Number.isFinite(averageScore) || averageScore < 0 || averageScore > 100) {
          throw new Error(`studentPerformanceSnapshot[${index}].averageScore must be between 0 and 100.`);
        }

        return {
          topic,
          averageScore,
          cefrBand,
        };
      })
    : [];

  return {
    className,
    activeStudents,
    lowPerformingStudents,
    upcomingAssessments,
    teacherQuestion,
    syllabusReference: syllabusReference || undefined,
    language: ensureLanguage(String(source.language ?? '')),
    studentPerformanceSnapshot,
  };
}

export async function POST(request: NextRequest) {
  try {
    const role = request.cookies.get('eduspell_role')?.value;
    if (role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can access this endpoint.' }, { status: 403 });
    }

    const payload = parsePayload(await request.json());
    const teacherId = request.cookies.get('eduspell_uid')?.value || 'teacher-unknown';

    const analyticsService = new AnalyticsService();
    const response = await analyticsService.generateTeacherAssistantResponse({
      teacherId,
      className: payload.className,
      activeStudents: payload.activeStudents,
      lowPerformingStudents: payload.lowPerformingStudents,
      upcomingAssessments: payload.upcomingAssessments,
      teacherQuestion: payload.teacherQuestion,
      syllabusReference: payload.syllabusReference,
      language: payload.language,
      studentPerformanceSnapshot: payload.studentPerformanceSnapshot,
    });

    return NextResponse.json({ data: response });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate AI assistant response.',
      },
      { status: 400 }
    );
  }
}
