import { ReportService } from '@eduspell/reports';
import { NextRequest, NextResponse } from 'next/server';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type ReportStyle = 'formal' | 'encouraging' | 'concise';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface ParentRequestPayload {
  student: {
    id: string;
    name: string;
    age: number;
    currentLevel: Difficulty;
    masteryScore: number;
    strengths: string[];
    weaknesses: string[];
  };
  reportingPeriod: string;
  attendanceRate: number;
  homeworkCompletionRate: number;
  subjectScores: Array<{
    subject: string;
    score: number;
    cefrBand: CefrBand;
    topics: Array<{ topic: string; score: number }>;
  }>;
  style: ReportStyle;
}

function ensureDifficulty(value: string): Difficulty {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  throw new Error('student.currentLevel must be beginner, intermediate, or advanced.');
}

function ensureStyle(value: string): ReportStyle {
  if (value === 'formal' || value === 'encouraging' || value === 'concise') {
    return value;
  }

  throw new Error('style must be formal, encouraging, or concise.');
}

function ensureCefr(value: string): CefrBand {
  if (value === 'Pre-A1' || value === 'A1' || value === 'A1+' || value === 'A2' || value === 'A2+' || value === 'B1') {
    return value;
  }

  throw new Error(`Invalid CEFR value: ${value}`);
}

function parsePayload(value: unknown): ParentRequestPayload {
  const source = value as Record<string, unknown>;
  const studentSource = (source.student ?? {}) as Record<string, unknown>;

  const studentId = String(studentSource.id ?? '').trim();
  const studentName = String(studentSource.name ?? '').trim();
  const age = Number(studentSource.age);
  const masteryScore = Number(studentSource.masteryScore);

  if (!studentId || !studentName) throw new Error('student id and name are required.');
  if (!Number.isInteger(age) || age < 5 || age > 18) throw new Error('student.age must be between 5 and 18.');
  if (!Number.isFinite(masteryScore) || masteryScore < 0 || masteryScore > 100) throw new Error('student.masteryScore must be between 0 and 100.');

  const reportingPeriod = String(source.reportingPeriod ?? '').trim();
  if (!reportingPeriod) throw new Error('reportingPeriod is required.');

  const attendanceRate = Number(source.attendanceRate);
  const homeworkCompletionRate = Number(source.homeworkCompletionRate);
  if (!Number.isFinite(attendanceRate) || attendanceRate < 0 || attendanceRate > 100) throw new Error('attendanceRate must be between 0 and 100.');
  if (!Number.isFinite(homeworkCompletionRate) || homeworkCompletionRate < 0 || homeworkCompletionRate > 100) {
    throw new Error('homeworkCompletionRate must be between 0 and 100.');
  }

  const subjectScores = Array.isArray(source.subjectScores)
    ? source.subjectScores.map((item, index) => {
        const current = item as Record<string, unknown>;
        const subject = String(current.subject ?? '').trim();
        const score = Number(current.score);
        const cefrBand = ensureCefr(String(current.cefrBand ?? 'A1'));

        if (!subject) throw new Error(`subjectScores[${index}].subject is required.`);
        if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error(`subjectScores[${index}].score must be between 0 and 100.`);

        const topics = Array.isArray(current.topics)
          ? current.topics.map((topic, topicIndex) => {
              const topicSource = topic as Record<string, unknown>;
              const topicName = String(topicSource.topic ?? '').trim();
              const topicScore = Number(topicSource.score);

              if (!topicName) throw new Error(`subjectScores[${index}].topics[${topicIndex}].topic is required.`);
              if (!Number.isFinite(topicScore) || topicScore < 0 || topicScore > 100) {
                throw new Error(`subjectScores[${index}].topics[${topicIndex}].score must be between 0 and 100.`);
              }

              return {
                topic: topicName,
                score: topicScore,
              };
            })
          : [];

        return {
          subject,
          score,
          cefrBand,
          topics,
        };
      })
    : [];

  if (subjectScores.length === 0) {
    throw new Error('subjectScores must include at least one subject.');
  }

  return {
    student: {
      id: studentId,
      name: studentName,
      age,
      currentLevel: ensureDifficulty(String(studentSource.currentLevel ?? '')),
      masteryScore,
      strengths: Array.isArray(studentSource.strengths) ? studentSource.strengths.map((item) => String(item).trim()).filter(Boolean) : [],
      weaknesses: Array.isArray(studentSource.weaknesses) ? studentSource.weaknesses.map((item) => String(item).trim()).filter(Boolean) : [],
    },
    reportingPeriod,
    attendanceRate,
    homeworkCompletionRate,
    subjectScores,
    style: ensureStyle(String(source.style ?? '')),
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = parsePayload(await request.json());
    const reportService = new ReportService();

    const report = await reportService.generateParentCommunicationReport({
      student: payload.student,
      reportingPeriod: payload.reportingPeriod,
      attendanceRate: payload.attendanceRate,
      homeworkCompletionRate: payload.homeworkCompletionRate,
      subjectScores: payload.subjectScores,
      style: payload.style,
    });

    return NextResponse.json({ data: report });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate parent communication report.',
      },
      { status: 400 }
    );
  }
}
