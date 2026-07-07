import { LessonEngineService } from '@eduspell/lesson-engine';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

interface WorksheetPayload {
  topicName: string;
  topicCategory: string;
  difficulty: Difficulty;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  objectiveTitle: string;
  objectiveDescription: string;
  questionCount: number;
  includeAnswerKey: boolean;
}

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

function parsePayload(value: unknown): WorksheetPayload {
  const source = value as Record<string, unknown>;
  const topicName = String(source.topicName ?? '').trim();
  const topicCategory = String(source.topicCategory ?? '').trim();
  const objectiveTitle = String(source.objectiveTitle ?? '').trim();
  const objectiveDescription = String(source.objectiveDescription ?? '').trim();

  if (!topicName) throw new Error('topicName is required.');
  if (!topicCategory) throw new Error('topicCategory is required.');
  if (!objectiveTitle) throw new Error('objectiveTitle is required.');
  if (!objectiveDescription) throw new Error('objectiveDescription is required.');

  const yearLevel = Number(source.yearLevel);
  if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 6) {
    throw new Error('yearLevel must be an integer between 1 and 6.');
  }

  const questionCount = Number(source.questionCount);
  if (!Number.isInteger(questionCount) || questionCount < 4 || questionCount > 24) {
    throw new Error('questionCount must be between 4 and 24.');
  }

  return {
    topicName,
    topicCategory,
    difficulty: ensureDifficulty(String(source.difficulty ?? '')),
    yearLevel: yearLevel as 1 | 2 | 3 | 4 | 5 | 6,
    objectiveTitle,
    objectiveDescription,
    questionCount,
    includeAnswerKey: Boolean(source.includeAnswerKey),
  };
}

async function buildWorksheetPdf(input: {
  title: string;
  yearLevel: number;
  cefrBand: CefrBand;
  topicCategory: string;
  objectiveTitle: string;
  questions: Array<{ prompt: string; answer: string }>;
  includeAnswerKey: boolean;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  let currentPage = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const lineHeight = 18;

  const drawLine = (text: string, x = 48, size = 11, bold = false) => {
    currentPage.drawText(text, {
      x,
      y,
      size,
      font: bold ? boldFont : font,
    });
    y -= lineHeight;
  };

  drawLine('EduSpell Pro AI Worksheet', 48, 18, true);
  drawLine(input.title, 48, 14, true);
  drawLine(`Year ${input.yearLevel} | CEFR ${input.cefrBand} | Category: ${input.topicCategory}`);
  drawLine(`Objective: ${input.objectiveTitle}`);
  y -= 8;

  drawLine('Questions', 48, 13, true);
  input.questions.forEach((item, index) => {
    if (y < 110) {
      currentPage = pdf.addPage([595, 842]);
      y = 800;
      currentPage.drawText('EduSpell Pro AI Worksheet (continued)', { x: 48, y, size: 14, font: boldFont });
      y -= 28;
    }

    drawLine(`${index + 1}. ${item.prompt}`);
    drawLine('Answer: _______________________________________________', 64);
    y -= 4;
  });

  if (input.includeAnswerKey) {
    let answerPage = pdf.addPage([595, 842]);
    let answerY = 800;
    answerPage.drawText('Answer Key', { x: 48, y: answerY, size: 18, font: boldFont });
    answerY -= 24;
    answerPage.drawText(`${input.title} | Year ${input.yearLevel} | CEFR ${input.cefrBand}`, { x: 48, y: answerY, size: 11, font });
    answerY -= 22;

    input.questions.forEach((item, index) => {
      if (answerY < 64) {
        answerPage = pdf.addPage([595, 842]);
        answerY = 800;
        answerPage.drawText('Answer Key (continued)', { x: 48, y: answerY, size: 14, font: boldFont });
        answerY -= 24;
      }

      answerPage.drawText(`${index + 1}. ${item.answer}`, { x: 48, y: answerY, size: 11, font });
      answerY -= 18;
    });
  }

  return pdf.save();
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
    const items = await lessonEngine.generateAiWorksheet({
      topic: {
        id: `topic-${payload.topicName.toLowerCase().replace(/\s+/g, '-')}`,
        name: payload.topicName,
        category: payload.topicCategory,
        difficulty: payload.difficulty,
      },
      objective: {
        id: `objective-${payload.objectiveTitle.toLowerCase().replace(/\s+/g, '-')}`,
        title: payload.objectiveTitle,
        description: payload.objectiveDescription,
        difficulty: payload.difficulty,
      },
      yearLevel: payload.yearLevel,
      cefrBand,
      questionCount: payload.questionCount,
      includeAnswerKey: payload.includeAnswerKey,
    });

    const pdfBytes = await buildWorksheetPdf({
      title: payload.topicName,
      yearLevel: payload.yearLevel,
      cefrBand,
      topicCategory: payload.topicCategory,
      objectiveTitle: payload.objectiveTitle,
      questions: items,
      includeAnswerKey: payload.includeAnswerKey,
    });

    const safeTitle = payload.topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `worksheet-year-${payload.yearLevel}-${safeTitle}.pdf`;

    return NextResponse.json({
      data: {
        yearLevel: payload.yearLevel,
        cefrBand,
        items,
        includeAnswerKey: payload.includeAnswerKey,
        fileName,
        pdfBase64: Buffer.from(pdfBytes).toString('base64'),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to generate worksheet PDF.',
      },
      { status: 400 }
    );
  }
}
