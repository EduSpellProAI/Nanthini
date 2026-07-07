import { aiTelemetryService, geminiClient } from '@eduspell/ai-core';
import { FirestoreRepository } from '@eduspell/database';
import { createId } from '@eduspell/shared';
import type { LearningObjective, TopicSkill } from '@eduspell/shared';
import type {
  AIAnswerSchemeRequest,
  AIExamPaperRequest,
  AIHomeworkRequest,
  AILessonRequest,
  AIWorksheetRequest,
  AnswerSchemeItem,
  ExamPaper,
  ExamQuestion,
  ExamSection,
  ExamSectionType,
  HomeworkTask,
  LessonActivity,
  LessonTemplate,
  MarkingAssistantResult,
  MarkingQuestionType,
  WorksheetItem,
} from './models';

interface LessonStorageRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  recordType: 'lesson' | 'worksheet' | 'homework' | 'exam-paper' | 'marking-assistant';
  payload: unknown;
  topicId: string;
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid AI output: ${field} must be a non-empty string.`);
  }

  return value.trim();
}

function expectNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid AI output: ${field} must be a number.`);
  }

  return value;
}

function expectArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid AI output: ${field} must be an array.`);
  }

  return value;
}

function expectDifficulty(value: string): LessonTemplate['difficulty'] {
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }

  throw new Error(`Invalid AI output: difficulty value ${value} is not supported.`);
}

function expectCefrBand(value: string): LessonTemplate['cefrBand'] {
  if (value === 'Pre-A1' || value === 'A1' || value === 'A1+' || value === 'A2' || value === 'A2+' || value === 'B1') {
    return value;
  }

  throw new Error(`Invalid AI output: CEFR band ${value} is not supported.`);
}

function expectExamSectionType(value: string): ExamSectionType {
  if (value === 'objective' || value === 'subjective' || value === 'comprehension' || value === 'vocabulary' || value === 'grammar' || value === 'writing') {
    return value;
  }

  throw new Error(`Invalid exam section type: ${value}`);
}

function expectMarkingQuestionType(value: string): MarkingQuestionType {
  if (value === 'objective' || value === 'subjective' || value === 'comprehension' || value === 'essay' || value === 'writing') {
    return value;
  }

  throw new Error(`Invalid marking question type: ${value}`);
}

export class LessonEngineService {
  private readonly lessonRepository = new FirestoreRepository<LessonStorageRecord>('lessons');

  createLessonTemplate(title: string, topic: TopicSkill, objectives: LearningObjective[]): LessonTemplate {
    const activities: LessonActivity[] = [
      { id: 'intro', title: 'Warm-up discussion', type: 'discussion', durationMinutes: 10 },
      { id: 'practice', title: 'Guided practice', type: 'practice', durationMinutes: 20 },
      { id: 'reflection', title: 'Reflection', type: 'reflection', durationMinutes: 10 },
    ];

    return {
      id: `lesson-${Math.random().toString(36).slice(2, 8)}`,
      title,
      topic,
      objectives,
      activities,
      materials: ['Student workbook', 'Word cards', 'Mini whiteboards'],
      assessmentPlan: 'Observe guided practice and assess an exit ticket for objective mastery.',
      totalDurationMinutes: activities.reduce((sum, item) => sum + item.durationMinutes, 0),
      yearLevel: 4,
      cefrBand: 'A2',
      difficulty: topic.difficulty,
    };
  }

  createWorksheetItems(prompts: string[]): WorksheetItem[] {
    return prompts.map((prompt, index) => ({ id: `worksheet-${index + 1}`, prompt, answer: `Answer ${index + 1}` }));
  }

  generateHomework(title: string, dueDate: string): HomeworkTask {
    return {
      id: `homework-${Math.random().toString(36).slice(2, 8)}`,
      title,
      instructions: 'Complete the tasks and return them on time.',
      dueDate,
    };
  }

  async generateAiLesson(request: AILessonRequest): Promise<LessonTemplate> {
    const prompt = {
      topic: request.topic,
      objectives: request.objectives,
      classGrade: request.classGrade,
      yearLevel: request.yearLevel,
      cefrBand: request.cefrBand,
      durationMinutes: request.durationMinutes,
      studentNeeds: request.studentNeeds,
    };

    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-lesson-generator',
        systemPrompt:
          'You are an instructional design specialist for CEFR-aligned primary classrooms (Year 1-6). Return strict JSON with fields: title, difficulty, cefrBand, materials (string[]), assessmentPlan (string), activities[]. Each activity requires title, type (discussion|practice|game|reflection), durationMinutes.',
        userPrompt: JSON.stringify(prompt),
        temperature: 0.3,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const activities = expectArray(source.activities, 'activities').map((item, index) => {
            const itemSource = item as Record<string, unknown>;
            const type = expectString(itemSource.type, `activities[${index}].type`);
            if (!['discussion', 'practice', 'game', 'reflection'].includes(type)) {
              throw new Error(`Invalid activity type: ${type}`);
            }

            return {
              id: createId('activity'),
              title: expectString(itemSource.title, `activities[${index}].title`),
              type: type as LessonActivity['type'],
              durationMinutes: Math.max(5, Math.round(expectNumber(itemSource.durationMinutes, `activities[${index}].durationMinutes`))),
            };
          });

          return {
            title: expectString(source.title, 'title'),
            difficulty: expectString(source.difficulty, 'difficulty'),
            cefrBand: expectString(source.cefrBand, 'cefrBand'),
            materials: expectArray(source.materials, 'materials').map((item, index) => expectString(item, `materials[${index}]`)),
            assessmentPlan: expectString(source.assessmentPlan, 'assessmentPlan'),
            activities,
          };
        },
      }
    );

    const totalDurationMinutes = generated.data.activities.reduce((sum, item) => sum + item.durationMinutes, 0);

    const template: LessonTemplate = {
      id: createId('lesson'),
      title: generated.data.title,
      topic: request.topic,
      objectives: request.objectives,
      activities: generated.data.activities,
      materials: generated.data.materials,
      assessmentPlan: generated.data.assessmentPlan,
      totalDurationMinutes,
      yearLevel: request.yearLevel,
      cefrBand: expectCefrBand(generated.data.cefrBand),
      difficulty: expectDifficulty(generated.data.difficulty),
    };

    const now = new Date().toISOString();
    await this.lessonRepository.create({
      createdAt: now,
      updatedAt: now,
      recordType: 'lesson',
      payload: template,
      topicId: request.topic.id,
    });

    await aiTelemetryService.log({
      feature: 'ai-lesson-generator',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(template).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { topicId: request.topic.id, objectiveCount: request.objectives.length },
    });

    return template;
  }

  async generateAiWorksheet(request: AIWorksheetRequest): Promise<WorksheetItem[]> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-worksheet-generator',
        systemPrompt:
          'Create CEFR-aligned worksheet items for Year 1-6 as JSON array field items. Each item has prompt and answer. Keep answers concise, age-appropriate, and instructionally accurate.',
        userPrompt: JSON.stringify(request),
        temperature: 0.35,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const items = expectArray(source.items, 'items');
          if (items.length === 0) {
            throw new Error('AI output must contain at least one worksheet item.');
          }

          return items.map((item, index) => {
            const itemSource = item as Record<string, unknown>;
            return {
              id: createId(`worksheet-${index + 1}`),
              prompt: expectString(itemSource.prompt, `items[${index}].prompt`),
              answer: expectString(itemSource.answer, `items[${index}].answer`),
            };
          });
        },
      }
    );

    const now = new Date().toISOString();
    await this.lessonRepository.create({
      createdAt: now,
      updatedAt: now,
      recordType: 'worksheet',
      payload: generated.data,
      topicId: request.topic.id,
    });

    await aiTelemetryService.log({
      feature: 'ai-worksheet-generator',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(generated.data).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { topicId: request.topic.id, yearLevel: request.yearLevel, cefrBand: request.cefrBand, questionCount: request.questionCount },
    });

    return generated.data;
  }

  async generateAiHomework(request: AIHomeworkRequest): Promise<HomeworkTask> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-homework-generator',
        systemPrompt:
          'Create a homework JSON object with fields title and instructions. Instructions should include clear numbered steps and assessment expectations.',
        userPrompt: JSON.stringify(request),
        temperature: 0.25,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          return {
            title: expectString(source.title, 'title'),
            instructions: expectString(source.instructions, 'instructions'),
          };
        },
      }
    );

    const homework: HomeworkTask = {
      id: createId('homework'),
      title: generated.data.title,
      instructions: generated.data.instructions,
      dueDate: request.dueDate,
    };

    const now = new Date().toISOString();
    await this.lessonRepository.create({
      createdAt: now,
      updatedAt: now,
      recordType: 'homework',
      payload: homework,
      topicId: request.topic.id,
    });

    await aiTelemetryService.log({
      feature: 'ai-homework-generator',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(homework).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { topicId: request.topic.id, dueDate: request.dueDate },
    });

    return homework;
  }

  async generateAiExamPaper(request: AIExamPaperRequest): Promise<ExamPaper> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-exam-paper-generator',
        systemPrompt:
          'You generate CEFR-aligned primary English exam papers for Year 1-6. Return strict JSON with fields title, sections, answerScheme, markingGuide. sections must be an array with each section including type (objective|subjective|comprehension|vocabulary|grammar|writing), title, instructions, marks, questions. questions must include prompt, marks, answerScheme, markingGuide (string[]).',
        userPrompt: JSON.stringify(request),
        temperature: 0.25,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const sections = expectArray(source.sections, 'sections').map((section, sectionIndex) => {
            const sectionSource = section as Record<string, unknown>;
            const questions = expectArray(sectionSource.questions, `sections[${sectionIndex}].questions`).map((question, questionIndex) => {
              const questionSource = question as Record<string, unknown>;
              const questionMarks = Math.max(1, Math.round(expectNumber(questionSource.marks, `sections[${sectionIndex}].questions[${questionIndex}].marks`)));

              return {
                id: createId(`exam-question-${sectionIndex + 1}-${questionIndex + 1}`),
                prompt: expectString(questionSource.prompt, `sections[${sectionIndex}].questions[${questionIndex}].prompt`),
                marks: questionMarks,
                answerScheme: expectString(questionSource.answerScheme, `sections[${sectionIndex}].questions[${questionIndex}].answerScheme`),
                markingGuide: expectArray(questionSource.markingGuide, `sections[${sectionIndex}].questions[${questionIndex}].markingGuide`).map((point, pointIndex) =>
                  expectString(point, `sections[${sectionIndex}].questions[${questionIndex}].markingGuide[${pointIndex}]`)
                ),
              } satisfies ExamQuestion;
            });

            return {
              id: createId(`exam-section-${sectionIndex + 1}`),
              type: expectExamSectionType(expectString(sectionSource.type, `sections[${sectionIndex}].type`)),
              title: expectString(sectionSource.title, `sections[${sectionIndex}].title`),
              instructions: expectString(sectionSource.instructions, `sections[${sectionIndex}].instructions`),
              marks: Math.max(1, Math.round(expectNumber(sectionSource.marks, `sections[${sectionIndex}].marks`))),
              questions,
            } satisfies ExamSection;
          });

          const answerScheme = expectArray(source.answerScheme, 'answerScheme').map((item, index) => expectString(item, `answerScheme[${index}]`));
          const markingGuide = expectArray(source.markingGuide, 'markingGuide').map((item, index) => expectString(item, `markingGuide[${index}]`));

          return {
            title: expectString(source.title, 'title'),
            sections,
            answerScheme,
            markingGuide,
          };
        },
      }
    );

    const computedMarks = generated.data.sections.reduce((sum, section) => sum + section.questions.reduce((questionSum, question) => questionSum + question.marks, 0), 0);

    const examPaper: ExamPaper = {
      id: createId('exam-paper'),
      title: generated.data.title,
      topic: request.topic,
      yearLevel: request.yearLevel,
      cefrBand: request.cefrBand,
      difficulty: request.difficulty,
      durationMinutes: request.durationMinutes,
      totalMarks: computedMarks,
      sections: generated.data.sections,
      answerScheme: generated.data.answerScheme,
      markingGuide: generated.data.markingGuide,
    };

    const now = new Date().toISOString();
    await this.lessonRepository.create({
      createdAt: now,
      updatedAt: now,
      recordType: 'exam-paper',
      payload: examPaper,
      topicId: request.topic.id,
    });

    await aiTelemetryService.log({
      feature: 'ai-exam-paper-generator',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(examPaper).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: {
        topicId: request.topic.id,
        yearLevel: request.yearLevel,
        cefrBand: request.cefrBand,
        durationMinutes: request.durationMinutes,
        requestedMarks: request.totalMarks,
        sectionCount: request.sections.length,
      },
    });

    return examPaper;
  }

  async generateAiAnswerScheme(request: AIAnswerSchemeRequest): Promise<MarkingAssistantResult> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-answer-scheme-marking-assistant',
        systemPrompt:
          'You are an assessment specialist. Return strict JSON with fields title, items, rubric, markingGuide. items is an array and each item must contain questionId, type (objective|subjective|comprehension|essay|writing), prompt, marks, suggestedAnswer, rubric (string[]), markingGuide (string[]). Ensure CEFR and age-appropriate guidance for Year 1-6.',
        userPrompt: JSON.stringify(request),
        temperature: 0.2,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const items = expectArray(source.items, 'items').map((item, itemIndex) => {
            const itemSource = item as Record<string, unknown>;

            return {
              questionId: expectString(itemSource.questionId, `items[${itemIndex}].questionId`),
              type: expectMarkingQuestionType(expectString(itemSource.type, `items[${itemIndex}].type`)),
              prompt: expectString(itemSource.prompt, `items[${itemIndex}].prompt`),
              marks: Math.max(1, Math.round(expectNumber(itemSource.marks, `items[${itemIndex}].marks`))),
              suggestedAnswer: expectString(itemSource.suggestedAnswer, `items[${itemIndex}].suggestedAnswer`),
              rubric: expectArray(itemSource.rubric, `items[${itemIndex}].rubric`).map((point, pointIndex) =>
                expectString(point, `items[${itemIndex}].rubric[${pointIndex}]`)
              ),
              markingGuide: expectArray(itemSource.markingGuide, `items[${itemIndex}].markingGuide`).map((point, pointIndex) =>
                expectString(point, `items[${itemIndex}].markingGuide[${pointIndex}]`)
              ),
            } satisfies AnswerSchemeItem;
          });

          const rubric = expectArray(source.rubric, 'rubric').map((item, index) => expectString(item, `rubric[${index}]`));
          const markingGuide = expectArray(source.markingGuide, 'markingGuide').map((item, index) => expectString(item, `markingGuide[${index}]`));

          return {
            title: expectString(source.title, 'title'),
            items,
            rubric,
            markingGuide,
          };
        },
      }
    );

    const totalMarks = generated.data.items.reduce((sum, item) => sum + item.marks, 0);
    const result: MarkingAssistantResult = {
      id: createId('marking-assistant'),
      title: generated.data.title,
      yearLevel: request.yearLevel,
      cefrBand: request.cefrBand,
      difficulty: request.difficulty,
      totalMarks,
      items: generated.data.items,
      rubric: generated.data.rubric,
      markingGuide: generated.data.markingGuide,
    };

    const now = new Date().toISOString();
    await this.lessonRepository.create({
      createdAt: now,
      updatedAt: now,
      recordType: 'marking-assistant',
      payload: result,
      topicId: request.topic.id,
    });

    await aiTelemetryService.log({
      feature: 'ai-answer-scheme-marking-assistant',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(result).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: {
        topicId: request.topic.id,
        yearLevel: request.yearLevel,
        cefrBand: request.cefrBand,
        questionCount: request.questions.length,
      },
    });

    return result;
  }
}
