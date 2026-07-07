import { LessonEngineService } from '@eduspell/lesson-engine';
import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
type ExamSectionType = 'objective' | 'subjective' | 'comprehension' | 'vocabulary' | 'grammar' | 'writing';

interface ExamQuestion {
  id: string;
  prompt: string;
  marks: number;
  answerScheme: string;
  markingGuide: string[];
}

interface ExamSection {
  id: string;
  type: ExamSectionType;
  title: string;
  instructions: string;
  marks: number;
  questions: ExamQuestion[];
}

interface ExamPaperResult {
  id: string;
  title: string;
  yearLevel: number;
  cefrBand: CefrBand;
  difficulty: Difficulty;
  durationMinutes: number;
  totalMarks: number;
  sections: ExamSection[];
  answerScheme: string[];
  markingGuide: string[];
}

interface ExamPayload {
  topicName: string;
  topicCategory: string;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  difficulty: Difficulty;
  durationMinutes: number;
  totalMarks: number;
  sections: ExamSectionType[];
}

const EXAM_SECTION_OPTIONS: ExamSectionType[] = ['objective', 'subjective', 'comprehension', 'vocabulary', 'grammar', 'writing'];

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

function ensureSectionType(value: string): ExamSectionType {
  if (EXAM_SECTION_OPTIONS.includes(value as ExamSectionType)) {
    return value as ExamSectionType;
  }

  throw new Error(`Invalid exam section type: ${value}`);
}

function parsePayload(value: unknown): ExamPayload {
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
  if (!Number.isInteger(durationMinutes) || durationMinutes < 30 || durationMinutes > 180) {
    throw new Error('durationMinutes must be between 30 and 180.');
  }

  const totalMarks = Number(source.totalMarks);
  if (!Number.isInteger(totalMarks) || totalMarks < 20 || totalMarks > 200) {
    throw new Error('totalMarks must be between 20 and 200.');
  }

  const sections = Array.isArray(source.sections)
    ? source.sections.map((item) => ensureSectionType(String(item))).filter((item, index, arr) => arr.indexOf(item) === index)
    : [];

  if (sections.length === 0) {
    throw new Error('At least one exam section is required.');
  }

  return {
    topicName,
    topicCategory,
    yearLevel: yearLevel as 1 | 2 | 3 | 4 | 5 | 6,
    difficulty: ensureDifficulty(String(source.difficulty ?? '')),
    durationMinutes,
    totalMarks,
    sections,
  };
}

function wrapText(text: string, maxCharsPerLine = 90): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxCharsPerLine) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines;
}

async function buildExamPdf(exam: ExamPaperResult): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const width = 595;
  const height = 842;
  let page = pdf.addPage([width, height]);
  let y = 800;
  const lineGap = 16;

  const ensurePageSpace = (linesNeeded = 1) => {
    if (y - linesNeeded * lineGap < 70) {
      page = pdf.addPage([width, height]);
      y = 800;
    }
  };

  const drawLine = (text: string, x = 48, size = 11, bold = false) => {
    ensurePageSpace(1);
    page.drawText(text, { x, y, size, font: bold ? boldFont : font });
    y -= lineGap;
  };

  drawLine('EduSpell Pro AI Exam Paper', 48, 18, true);
  drawLine(exam.title, 48, 14, true);
  drawLine(`Year ${exam.yearLevel} | CEFR ${exam.cefrBand} | Difficulty ${exam.difficulty}`);
  drawLine(`Duration: ${exam.durationMinutes} minutes | Total Marks: ${exam.totalMarks}`);
  y -= 8;

  exam.sections.forEach((section, sectionIndex) => {
    drawLine(`Section ${sectionIndex + 1}: ${section.title} (${section.type}) - ${section.marks} marks`, 48, 12, true);
    wrapText(section.instructions, 88).forEach((line) => drawLine(line, 56));
    y -= 4;

    section.questions.forEach((question, questionIndex) => {
      wrapText(`${questionIndex + 1}. ${question.prompt} [${question.marks} marks]`, 82).forEach((line, lineIndex) => {
        drawLine(line, lineIndex === 0 ? 64 : 72);
      });
      y -= 2;
    });

    y -= 6;
  });

  page = pdf.addPage([width, height]);
  y = 800;
  page.drawText('Answer Scheme', { x: 48, y, size: 18, font: boldFont });
  y -= 24;
  exam.answerScheme.forEach((line, index) => {
    wrapText(`${index + 1}. ${line}`, 84).forEach((item, itemIndex) => {
      drawLine(item, itemIndex === 0 ? 48 : 56);
    });
  });

  page = pdf.addPage([width, height]);
  y = 800;
  page.drawText('Marking Guide', { x: 48, y, size: 18, font: boldFont });
  y -= 24;
  exam.markingGuide.forEach((line, index) => {
    wrapText(`${index + 1}. ${line}`, 84).forEach((item, itemIndex) => {
      drawLine(item, itemIndex === 0 ? 48 : 56);
    });
  });

  return pdf.save();
}

async function buildExamDocx(exam: ExamPaperResult): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: 'EduSpell Pro AI Exam Paper', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: exam.title }),
    new Paragraph({ text: `Year ${exam.yearLevel} | CEFR ${exam.cefrBand} | Difficulty ${exam.difficulty}` }),
    new Paragraph({ text: `Duration: ${exam.durationMinutes} minutes | Total Marks: ${exam.totalMarks}` }),
    new Paragraph({ text: '' }),
  ];

  exam.sections.forEach((section, sectionIndex) => {
    children.push(new Paragraph({ text: `Section ${sectionIndex + 1}: ${section.title} (${section.type}) - ${section.marks} marks`, heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ text: `Instructions: ${section.instructions}` }));
    section.questions.forEach((question, questionIndex) => {
      children.push(new Paragraph({ text: `${questionIndex + 1}. ${question.prompt} [${question.marks} marks]` }));
    });
    children.push(new Paragraph({ text: '' }));
  });

  children.push(new Paragraph({ text: 'Answer Scheme', heading: HeadingLevel.HEADING_1 }));
  exam.answerScheme.forEach((line, index) => children.push(new Paragraph({ text: `${index + 1}. ${line}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Marking Guide', heading: HeadingLevel.HEADING_1 }));
  exam.markingGuide.forEach((line, index) => children.push(new Paragraph({ text: `${index + 1}. ${line}` })));

  const document = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(document));
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
    const examPaper = await lessonEngine.generateAiExamPaper({
      topic: {
        id: `topic-${payload.topicName.toLowerCase().replace(/\s+/g, '-')}`,
        name: payload.topicName,
        category: payload.topicCategory,
        difficulty: payload.difficulty,
      },
      yearLevel: payload.yearLevel,
      cefrBand,
      difficulty: payload.difficulty,
      durationMinutes: payload.durationMinutes,
      totalMarks: payload.totalMarks,
      sections: payload.sections,
    });

    const examPayload: ExamPaperResult = {
      id: examPaper.id,
      title: examPaper.title,
      yearLevel: examPaper.yearLevel,
      cefrBand: examPaper.cefrBand,
      difficulty: examPaper.difficulty,
      durationMinutes: examPaper.durationMinutes,
      totalMarks: examPaper.totalMarks,
      sections: examPaper.sections,
      answerScheme: examPaper.answerScheme,
      markingGuide: examPaper.markingGuide,
    };

    const safeTitle = payload.topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileBase = `exam-paper-year-${payload.yearLevel}-${safeTitle}`;

    const [pdfBytes, docxBytes] = await Promise.all([buildExamPdf(examPayload), buildExamDocx(examPayload)]);

    return NextResponse.json({
      data: {
        examPaper: examPayload,
        pdfBase64: Buffer.from(pdfBytes).toString('base64'),
        docxBase64: docxBytes.toString('base64'),
        pdfFileName: `${fileBase}.pdf`,
        docxFileName: `${fileBase}.docx`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate exam paper.',
      },
      { status: 400 }
    );
  }
}
