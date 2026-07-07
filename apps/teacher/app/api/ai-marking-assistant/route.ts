import { LessonEngineService } from '@eduspell/lesson-engine';
import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
type MarkingQuestionType = 'objective' | 'subjective' | 'comprehension' | 'essay' | 'writing';

interface MarkingQuestionInput {
  id: string;
  type: MarkingQuestionType;
  prompt: string;
  marks: number;
}

interface AnswerSchemeItem {
  questionId: string;
  type: MarkingQuestionType;
  prompt: string;
  marks: number;
  suggestedAnswer: string;
  rubric: string[];
  markingGuide: string[];
}

interface MarkingAssistantResult {
  id: string;
  title: string;
  yearLevel: number;
  cefrBand: CefrBand;
  difficulty: Difficulty;
  totalMarks: number;
  items: AnswerSchemeItem[];
  rubric: string[];
  markingGuide: string[];
}

interface GeneratePayload {
  action: 'generate';
  title: string;
  topicName: string;
  topicCategory: string;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  difficulty: Difficulty;
  questions: MarkingQuestionInput[];
}

interface ExportPayload {
  action: 'export';
  result: MarkingAssistantResult;
}

const QUESTION_TYPES: MarkingQuestionType[] = ['objective', 'subjective', 'comprehension', 'essay', 'writing'];

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

function ensureQuestionType(value: string): MarkingQuestionType {
  if (QUESTION_TYPES.includes(value as MarkingQuestionType)) {
    return value as MarkingQuestionType;
  }

  throw new Error(`question type ${value} is invalid.`);
}

function parseGeneratePayload(value: unknown): GeneratePayload {
  const source = value as Record<string, unknown>;
  const title = String(source.title ?? '').trim();
  const topicName = String(source.topicName ?? '').trim();
  const topicCategory = String(source.topicCategory ?? '').trim();

  if (!title) throw new Error('title is required.');
  if (!topicName) throw new Error('topicName is required.');
  if (!topicCategory) throw new Error('topicCategory is required.');

  const yearLevel = Number(source.yearLevel);
  if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 6) {
    throw new Error('yearLevel must be between 1 and 6.');
  }

  const questions = Array.isArray(source.questions)
    ? source.questions.map((item, index) => {
        const input = item as Record<string, unknown>;
        const prompt = String(input.prompt ?? '').trim();
        if (!prompt) {
          throw new Error(`questions[${index}].prompt is required.`);
        }

        const marks = Number(input.marks);
        if (!Number.isInteger(marks) || marks < 1 || marks > 30) {
          throw new Error(`questions[${index}].marks must be between 1 and 30.`);
        }

        return {
          id: String(input.id ?? `q-${index + 1}`),
          type: ensureQuestionType(String(input.type ?? '')),
          prompt,
          marks,
        } satisfies MarkingQuestionInput;
      })
    : [];

  if (questions.length === 0) {
    throw new Error('At least one question is required.');
  }

  return {
    action: 'generate',
    title,
    topicName,
    topicCategory,
    yearLevel: yearLevel as 1 | 2 | 3 | 4 | 5 | 6,
    difficulty: ensureDifficulty(String(source.difficulty ?? '')),
    questions,
  };
}

function parseExportPayload(value: unknown): ExportPayload {
  const source = value as Record<string, unknown>;
  const rawResult = source.result as Record<string, unknown>;

  if (!rawResult) {
    throw new Error('result is required for export.');
  }

  const title = String(rawResult.title ?? '').trim();
  if (!title) {
    throw new Error('result.title is required.');
  }

  const items = Array.isArray(rawResult.items)
    ? rawResult.items.map((item, index) => {
        const current = item as Record<string, unknown>;
        const rubric = Array.isArray(current.rubric) ? current.rubric.map((point) => String(point).trim()).filter(Boolean) : [];
        const markingGuide = Array.isArray(current.markingGuide)
          ? current.markingGuide.map((point) => String(point).trim()).filter(Boolean)
          : [];

        return {
          questionId: String(current.questionId ?? `q-${index + 1}`),
          type: ensureQuestionType(String(current.type ?? '')),
          prompt: String(current.prompt ?? '').trim(),
          marks: Number(current.marks ?? 0),
          suggestedAnswer: String(current.suggestedAnswer ?? '').trim(),
          rubric,
          markingGuide,
        } satisfies AnswerSchemeItem;
      })
    : [];

  if (items.length === 0) {
    throw new Error('result.items must contain at least one answer scheme item.');
  }

  const rubric = Array.isArray(rawResult.rubric) ? rawResult.rubric.map((point) => String(point).trim()).filter(Boolean) : [];
  const markingGuide = Array.isArray(rawResult.markingGuide) ? rawResult.markingGuide.map((point) => String(point).trim()).filter(Boolean) : [];

  return {
    action: 'export',
    result: {
      id: String(rawResult.id ?? 'edited-marking-assistant'),
      title,
      yearLevel: Number(rawResult.yearLevel ?? 1),
      cefrBand: String(rawResult.cefrBand ?? 'A1') as CefrBand,
      difficulty: ensureDifficulty(String(rawResult.difficulty ?? 'beginner')),
      totalMarks: Number(rawResult.totalMarks ?? items.reduce((sum, item) => sum + item.marks, 0)),
      items,
      rubric,
      markingGuide,
    },
  };
}

function wrapText(text: string, maxChars = 88): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines;
}

async function buildPdf(result: MarkingAssistantResult): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const width = 595;
  const height = 842;
  let page = pdf.addPage([width, height]);
  let y = 800;
  const lineGap = 16;

  const drawLine = (text: string, x = 48, size = 11, bold = false) => {
    if (y < 70) {
      page = pdf.addPage([width, height]);
      y = 800;
    }

    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? boldFont : font,
    });
    y -= lineGap;
  };

  drawLine('EduSpell Pro AI Answer Scheme & Marking Assistant', 48, 16, true);
  drawLine(result.title, 48, 13, true);
  drawLine(`Year ${result.yearLevel} | CEFR ${result.cefrBand} | Difficulty ${result.difficulty}`);
  drawLine(`Total marks: ${result.totalMarks}`);
  y -= 6;

  result.items.forEach((item, index) => {
    drawLine(`Q${index + 1} (${item.type}) - ${item.marks} marks`, 48, 12, true);
    wrapText(item.prompt).forEach((line) => drawLine(line, 56));
    drawLine('Suggested answer:', 56, 11, true);
    wrapText(item.suggestedAnswer).forEach((line) => drawLine(line, 64));
    drawLine('Rubric:', 56, 11, true);
    item.rubric.forEach((point, pointIndex) => wrapText(`${pointIndex + 1}. ${point}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 64 : 72)));
    drawLine('Marking guide:', 56, 11, true);
    item.markingGuide.forEach((point, pointIndex) => wrapText(`${pointIndex + 1}. ${point}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 64 : 72)));
    y -= 4;
  });

  page = pdf.addPage([width, height]);
  y = 800;
  page.drawText('Overall Rubric', { x: 48, y, size: 16, font: boldFont });
  y -= 24;
  result.rubric.forEach((point, index) => wrapText(`${index + 1}. ${point}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 48 : 56)));

  page = pdf.addPage([width, height]);
  y = 800;
  page.drawText('Overall Marking Guide', { x: 48, y, size: 16, font: boldFont });
  y -= 24;
  result.markingGuide.forEach((point, index) => wrapText(`${index + 1}. ${point}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 48 : 56)));

  return pdf.save();
}

async function buildDocx(result: MarkingAssistantResult): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: 'EduSpell Pro AI Answer Scheme & Marking Assistant', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: result.title }),
    new Paragraph({ text: `Year ${result.yearLevel} | CEFR ${result.cefrBand} | Difficulty ${result.difficulty}` }),
    new Paragraph({ text: `Total marks: ${result.totalMarks}` }),
    new Paragraph({ text: '' }),
  ];

  result.items.forEach((item, index) => {
    children.push(new Paragraph({ text: `Q${index + 1} (${item.type}) - ${item.marks} marks`, heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ text: item.prompt }));
    children.push(new Paragraph({ text: `Suggested answer: ${item.suggestedAnswer}` }));
    children.push(new Paragraph({ text: 'Rubric:' }));
    item.rubric.forEach((point, pointIndex) => children.push(new Paragraph({ text: `${pointIndex + 1}. ${point}` })));
    children.push(new Paragraph({ text: 'Marking guide:' }));
    item.markingGuide.forEach((point, pointIndex) => children.push(new Paragraph({ text: `${pointIndex + 1}. ${point}` })));
    children.push(new Paragraph({ text: '' }));
  });

  children.push(new Paragraph({ text: 'Overall Rubric', heading: HeadingLevel.HEADING_1 }));
  result.rubric.forEach((point, index) => children.push(new Paragraph({ text: `${index + 1}. ${point}` })));

  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: 'Overall Marking Guide', heading: HeadingLevel.HEADING_1 }));
  result.markingGuide.forEach((point, index) => children.push(new Paragraph({ text: `${index + 1}. ${point}` })));

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

    const body = (await request.json()) as { action?: string };

    if (body.action === 'generate') {
      const payload = parseGeneratePayload(body);
      const cefrBand = mapYearToCefr(payload.yearLevel);
      const lessonEngine = new LessonEngineService();

      const result = await lessonEngine.generateAiAnswerScheme({
        title: payload.title,
        topic: {
          id: `topic-${payload.topicName.toLowerCase().replace(/\s+/g, '-')}`,
          name: payload.topicName,
          category: payload.topicCategory,
          difficulty: payload.difficulty,
        },
        yearLevel: payload.yearLevel,
        cefrBand,
        difficulty: payload.difficulty,
        questions: payload.questions,
      });

      return NextResponse.json({ data: result });
    }

    if (body.action === 'export') {
      const payload = parseExportPayload(body);
      const safeTitle = payload.result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const fileBase = `marking-assistant-${safeTitle}`;

      const [pdfBytes, docxBytes] = await Promise.all([buildPdf(payload.result), buildDocx(payload.result)]);

      return NextResponse.json({
        data: {
          pdfBase64: Buffer.from(pdfBytes).toString('base64'),
          docxBase64: docxBytes.toString('base64'),
          pdfFileName: `${fileBase}.pdf`,
          docxFileName: `${fileBase}.docx`,
        },
      });
    }

    throw new Error('action must be generate or export.');
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to process marking assistant request.',
      },
      { status: 400 }
    );
  }
}
