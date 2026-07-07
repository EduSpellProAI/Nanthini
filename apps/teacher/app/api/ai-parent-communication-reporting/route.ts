import { ReportService } from '@eduspell/reports';
import type { ParentProgressReport } from '@eduspell/reports';
import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type ReportStyle = 'formal' | 'encouraging' | 'concise';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface SubjectScoreInput {
  subject: string;
  score: number;
  cefrBand: CefrBand;
  topics: Array<{ topic: string; score: number }>;
}

interface GeneratePayload {
  action: 'generate';
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
  subjectScores: SubjectScoreInput[];
  style: ReportStyle;
}

interface ExportPayload {
  action: 'export';
  report: ParentProgressReport;
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

function parseGeneratePayload(value: unknown): GeneratePayload {
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

  if (!Number.isFinite(attendanceRate) || attendanceRate < 0 || attendanceRate > 100) {
    throw new Error('attendanceRate must be between 0 and 100.');
  }

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

  const strengths = Array.isArray(studentSource.strengths)
    ? studentSource.strengths.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const weaknesses = Array.isArray(studentSource.weaknesses)
    ? studentSource.weaknesses.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    action: 'generate',
    student: {
      id: studentId,
      name: studentName,
      age,
      currentLevel: ensureDifficulty(String(studentSource.currentLevel ?? '')),
      masteryScore,
      strengths,
      weaknesses,
    },
    reportingPeriod,
    attendanceRate,
    homeworkCompletionRate,
    subjectScores,
    style: ensureStyle(String(source.style ?? '')),
  };
}

function parseExportPayload(value: unknown): ExportPayload {
  const source = value as Record<string, unknown>;
  const report = source.report as ParentProgressReport | undefined;

  if (!report || typeof report !== 'object') {
    throw new Error('report is required for export.');
  }

  return {
    action: 'export',
    report,
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

async function buildPdf(report: ParentProgressReport): Promise<Uint8Array> {
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

    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? bold : font,
    });
    y -= 16;
  };

  drawLine('EduSpell Pro Parent Communication Report', 48, 16, true);
  drawLine(`${report.studentName} | ${report.reportingPeriod} | Style: ${report.style}`, 48, 12, true);
  y -= 8;

  drawLine('Summary', 48, 12, true);
  wrapText(report.summary).forEach((line) => drawLine(line, 56));
  y -= 6;

  drawLine('Strengths', 48, 12, true);
  report.strengths.forEach((item, index) => wrapText(`${index + 1}. ${item}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 56 : 64)));

  y -= 4;
  drawLine('Weaknesses', 48, 12, true);
  report.weaknesses.forEach((item, index) => wrapText(`${index + 1}. ${item}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 56 : 64)));

  y -= 4;
  drawLine('Attendance', 48, 12, true);
  wrapText(report.attendanceSummary).forEach((line) => drawLine(line, 56));

  y -= 4;
  drawLine('Homework Completion', 48, 12, true);
  wrapText(report.homeworkSummary).forEach((line) => drawLine(line, 56));

  y -= 4;
  drawLine('Learning Recommendations', 48, 12, true);
  report.learningRecommendations.forEach((item, index) => wrapText(`${index + 1}. ${item}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 56 : 64)));

  page = pdf.addPage([595, 842]);
  y = 800;
  drawLine('Personalized Parent Letter', 48, 14, true);
  wrapText(report.parentLetter, 86).forEach((line) => drawLine(line, 56));

  y -= 10;
  drawLine('Meeting Summary', 48, 14, true);
  wrapText(report.meetingSummary, 86).forEach((line) => drawLine(line, 56));

  return pdf.save();
}

async function buildDocx(report: ParentProgressReport): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: 'EduSpell Pro Parent Communication Report', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: `${report.studentName} | ${report.reportingPeriod} | Style: ${report.style}` }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: report.summary }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: 'Strengths', heading: HeadingLevel.HEADING_1 }),
  ];

  report.strengths.forEach((item, index) => children.push(new Paragraph({ text: `${index + 1}. ${item}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Weaknesses', heading: HeadingLevel.HEADING_1 }));
  report.weaknesses.forEach((item, index) => children.push(new Paragraph({ text: `${index + 1}. ${item}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Attendance', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: report.attendanceSummary }));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Homework Completion', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: report.homeworkSummary }));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Learning Recommendations', heading: HeadingLevel.HEADING_1 }));
  report.learningRecommendations.forEach((item, index) => children.push(new Paragraph({ text: `${index + 1}. ${item}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Personalized Parent Letter', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: report.parentLetter }));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Meeting Summary', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: report.meetingSummary }));

  const document = new Document({ sections: [{ children }] });
  return Buffer.from(await Packer.toBuffer(document));
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
    }

    if (body.action === 'export') {
      const payload = parseExportPayload(body);
      const [pdfBytes, docxBytes] = await Promise.all([buildPdf(payload.report), buildDocx(payload.report)]);
      const safeName = payload.report.studentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      return NextResponse.json({
        data: {
          pdfBase64: Buffer.from(pdfBytes).toString('base64'),
          docxBase64: docxBytes.toString('base64'),
          pdfFileName: `parent-report-${safeName}.pdf`,
          docxFileName: `parent-report-${safeName}.docx`,
        },
      });
    }

    throw new Error('action must be generate or export.');
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to process parent communication reporting request.',
      },
      { status: 400 }
    );
  }
}
