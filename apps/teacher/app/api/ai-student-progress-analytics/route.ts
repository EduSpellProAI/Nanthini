import { AnalyticsService } from '@eduspell/analytics';
import type { ClassStudentSnapshot, StudentProgressAnalytics, SubjectPerformance } from '@eduspell/analytics';
import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface GeneratePayload {
  action: 'generate';
  className: string;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  student: {
    id: string;
    name: string;
    masteryScore: number;
  };
  subjectPerformance: SubjectPerformance[];
  trends: Array<{ week: string; score: number }>;
  classStudents: ClassStudentSnapshot[];
}

interface ExportPayload {
  action: 'export';
  studentAnalytics: StudentProgressAnalytics;
}

function ensureDifficulty(value: string): Difficulty {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  throw new Error('difficulty must be one of: beginner, intermediate, advanced.');
}

function ensureCefr(value: string): CefrBand {
  if (value === 'Pre-A1' || value === 'A1' || value === 'A1+' || value === 'A2' || value === 'A2+' || value === 'B1') {
    return value;
  }

  throw new Error(`Invalid CEFR value: ${value}`);
}

function parseGeneratePayload(value: unknown): GeneratePayload {
  const source = value as Record<string, unknown>;
  const className = String(source.className ?? '').trim();
  if (!className) throw new Error('className is required.');

  const yearLevel = Number(source.yearLevel);
  if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 6) {
    throw new Error('yearLevel must be between 1 and 6.');
  }

  const studentSource = (source.student ?? {}) as Record<string, unknown>;
  const studentId = String(studentSource.id ?? '').trim();
  const studentName = String(studentSource.name ?? '').trim();
  const masteryScore = Number(studentSource.masteryScore);

  if (!studentId || !studentName) throw new Error('student id and name are required.');
  if (!Number.isFinite(masteryScore)) throw new Error('student.masteryScore must be numeric.');

  const subjectPerformance = Array.isArray(source.subjectPerformance)
    ? source.subjectPerformance.map((item, index) => {
        const current = item as Record<string, unknown>;
        const subject = String(current.subject ?? '').trim();
        const cefrBand = ensureCefr(String(current.cefrBand ?? 'A1'));
        const score = Number(current.score);

        if (!subject) throw new Error(`subjectPerformance[${index}].subject is required.`);
        if (!Number.isFinite(score)) throw new Error(`subjectPerformance[${index}].score must be numeric.`);

        const topics = Array.isArray(current.topics)
          ? current.topics.map((topic, topicIndex) => {
              const topicSource = topic as Record<string, unknown>;
              const topicName = String(topicSource.topic ?? '').trim();
              const topicScore = Number(topicSource.score);
              const trendDelta = Number(topicSource.trendDelta);

              if (!topicName) throw new Error(`subjectPerformance[${index}].topics[${topicIndex}].topic is required.`);
              if (!Number.isFinite(topicScore)) throw new Error(`subjectPerformance[${index}].topics[${topicIndex}].score must be numeric.`);
              if (!Number.isFinite(trendDelta)) throw new Error(`subjectPerformance[${index}].topics[${topicIndex}].trendDelta must be numeric.`);

              return {
                topic: topicName,
                score: topicScore,
                trendDelta,
              };
            })
          : [];

        return {
          subject,
          cefrBand,
          score,
          topics,
        };
      })
    : [];

  if (subjectPerformance.length === 0) {
    throw new Error('subjectPerformance must include at least one subject.');
  }

  const trends = Array.isArray(source.trends)
    ? source.trends.map((item, index) => {
        const current = item as Record<string, unknown>;
        const week = String(current.week ?? '').trim();
        const score = Number(current.score);
        if (!week) throw new Error(`trends[${index}].week is required.`);
        if (!Number.isFinite(score)) throw new Error(`trends[${index}].score must be numeric.`);
        return { week, score };
      })
    : [];

  if (trends.length === 0) {
    throw new Error('trends must include at least one data point.');
  }

  const classStudents = Array.isArray(source.classStudents)
    ? source.classStudents.map((item, index) => {
        const current = item as Record<string, unknown>;
        const currentId = String(current.studentId ?? '').trim();
        const currentName = String(current.studentName ?? '').trim();
        const cefrBand = ensureCefr(String(current.cefrBand ?? 'A1'));
        const overallScore = Number(current.overallScore);

        if (!currentId || !currentName) throw new Error(`classStudents[${index}] must include id and name.`);
        if (!Number.isFinite(overallScore)) throw new Error(`classStudents[${index}].overallScore must be numeric.`);

        return {
          studentId: currentId,
          studentName: currentName,
          cefrBand,
          overallScore,
        };
      })
    : [];

  return {
    action: 'generate',
    className,
    yearLevel: yearLevel as 1 | 2 | 3 | 4 | 5 | 6,
    student: {
      id: studentId,
      name: studentName,
      masteryScore,
    },
    subjectPerformance,
    trends,
    classStudents,
  };
}

function parseExportPayload(value: unknown): ExportPayload {
  const source = value as Record<string, unknown>;
  const studentAnalytics = source.studentAnalytics as StudentProgressAnalytics | undefined;

  if (!studentAnalytics || typeof studentAnalytics !== 'object') {
    throw new Error('studentAnalytics is required for export.');
  }

  return {
    action: 'export',
    studentAnalytics,
  };
}

function wrapText(text: string, maxChars = 88): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

async function buildReportPdf(data: StudentProgressAnalytics): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595, 842]);
  let y = 800;

  const drawLine = (text: string, x = 48, size = 11, isBold = false) => {
    if (y < 70) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }

    page.drawText(text, { x, y, size, font: isBold ? bold : font });
    y -= 16;
  };

  drawLine('EduSpell Pro Student Progress Analytics Report', 48, 16, true);
  drawLine(`${data.studentName} | Year ${data.yearLevel} | CEFR ${data.cefrBand}`, 48, 12, true);
  drawLine(`Overall Score: ${data.overallScore}`);
  y -= 8;

  drawLine('Performance by Subject', 48, 12, true);
  data.subjectPerformance.forEach((subject) => {
    drawLine(`${subject.subject} - ${subject.score} (${subject.cefrBand})`, 56);
    subject.topics.forEach((topic) => {
      drawLine(`- ${topic.topic}: ${topic.score} (Trend ${topic.trendDelta >= 0 ? '+' : ''}${topic.trendDelta})`, 68);
    });
  });

  y -= 8;
  drawLine('Strengths', 48, 12, true);
  data.strengths.forEach((item, index) => wrapText(`${index + 1}. ${item}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 56 : 64)));

  y -= 4;
  drawLine('Weaknesses', 48, 12, true);
  data.weaknesses.forEach((item, index) => wrapText(`${index + 1}. ${item}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 56 : 64)));

  y -= 4;
  drawLine('Recommendations', 48, 12, true);
  data.recommendations.forEach((item, index) => wrapText(`${index + 1}. ${item}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 56 : 64)));

  page = pdf.addPage([595, 842]);
  y = 800;
  drawLine('Learning Trends', 48, 14, true);
  data.trends.forEach((trend) => drawLine(`${trend.week}: ${trend.score}`, 56));

  return pdf.save();
}

async function buildReportDocx(data: StudentProgressAnalytics): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: 'EduSpell Pro Student Progress Analytics Report', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: `${data.studentName} | Year ${data.yearLevel} | CEFR ${data.cefrBand}` }),
    new Paragraph({ text: `Overall Score: ${data.overallScore}` }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: 'Performance by Subject', heading: HeadingLevel.HEADING_1 }),
  ];

  data.subjectPerformance.forEach((subject) => {
    children.push(new Paragraph({ text: `${subject.subject} - ${subject.score} (${subject.cefrBand})`, heading: HeadingLevel.HEADING_2 }));
    subject.topics.forEach((topic) => {
      children.push(new Paragraph({ text: `${topic.topic}: ${topic.score} (Trend ${topic.trendDelta >= 0 ? '+' : ''}${topic.trendDelta})` }));
    });
  });

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Strengths', heading: HeadingLevel.HEADING_1 }));
  data.strengths.forEach((item, index) => children.push(new Paragraph({ text: `${index + 1}. ${item}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Weaknesses', heading: HeadingLevel.HEADING_1 }));
  data.weaknesses.forEach((item, index) => children.push(new Paragraph({ text: `${index + 1}. ${item}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Recommendations', heading: HeadingLevel.HEADING_1 }));
  data.recommendations.forEach((item, index) => children.push(new Paragraph({ text: `${index + 1}. ${item}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Learning Trends', heading: HeadingLevel.HEADING_1 }));
  data.trends.forEach((trend) => children.push(new Paragraph({ text: `${trend.week}: ${trend.score}` })));

  const doc = new Document({ sections: [{ children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

export async function POST(request: NextRequest) {
  try {
    const role = request.cookies.get('eduspell_role')?.value;
    if (role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can access this endpoint.' }, { status: 403 });
    }

    const body = (await request.json()) as { action?: string };

    if (body.action === 'generate') {
      const payload = parseGeneratePayload(body);
      const analytics = new AnalyticsService();

      const studentAnalytics = await analytics.generateStudentProgressAnalytics({
        student: {
          id: payload.student.id,
          name: payload.student.name,
          age: 10,
          currentLevel: ensureDifficulty(payload.student.masteryScore >= 75 ? 'advanced' : payload.student.masteryScore >= 50 ? 'intermediate' : 'beginner'),
          masteryScore: payload.student.masteryScore,
          strengths: [],
          weaknesses: [],
        },
        yearLevel: payload.yearLevel,
        subjectPerformance: payload.subjectPerformance,
        trends: payload.trends,
      });

      const classAnalytics = await analytics.generateClassAnalytics({
        className: payload.className,
        students: payload.classStudents,
        subjectAverages: payload.subjectPerformance.map((item) => ({ subject: item.subject, score: item.score })),
      });

      return NextResponse.json({
        data: {
          studentAnalytics,
          classAnalytics,
        },
      });
    }

    if (body.action === 'export') {
      const payload = parseExportPayload(body);
      const safeName = payload.studentAnalytics.studentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const [pdfBytes, docxBytes] = await Promise.all([buildReportPdf(payload.studentAnalytics), buildReportDocx(payload.studentAnalytics)]);

      return NextResponse.json({
        data: {
          pdfBase64: Buffer.from(pdfBytes).toString('base64'),
          docxBase64: docxBytes.toString('base64'),
          pdfFileName: `student-progress-report-${safeName}.pdf`,
          docxFileName: `student-progress-report-${safeName}.docx`,
        },
      });
    }

    throw new Error('action must be generate or export.');
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to process student progress analytics request.',
      },
      { status: 400 }
    );
  }
}
