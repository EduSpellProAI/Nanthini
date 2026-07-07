import type { DifficultyLevel, LearningObjective, TopicSkill } from '@eduspell/shared';

export interface LessonActivity {
  id: string;
  title: string;
  type: 'discussion' | 'practice' | 'game' | 'reflection';
  durationMinutes: number;
}

export interface LessonTemplate {
  id: string;
  title: string;
  topic: TopicSkill;
  objectives: LearningObjective[];
  activities: LessonActivity[];
  materials: string[];
  assessmentPlan: string;
  totalDurationMinutes: number;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  difficulty: DifficultyLevel;
}

export interface WorksheetItem {
  id: string;
  prompt: string;
  answer: string;
}

export interface HomeworkTask {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
}

export interface AILessonRequest {
  topic: TopicSkill;
  objectives: LearningObjective[];
  classGrade: string;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  durationMinutes: number;
  studentNeeds: string[];
}

export interface AIWorksheetRequest {
  topic: TopicSkill;
  objective: LearningObjective;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  questionCount: number;
  includeAnswerKey: boolean;
}

export interface AIHomeworkRequest {
  topic: TopicSkill;
  objective: LearningObjective;
  dueDate: string;
  estimatedMinutes: number;
  parentSupportTips: boolean;
}

export type ExamSectionType = 'objective' | 'subjective' | 'comprehension' | 'vocabulary' | 'grammar' | 'writing';

export interface ExamQuestion {
  id: string;
  prompt: string;
  marks: number;
  answerScheme: string;
  markingGuide: string[];
}

export interface ExamSection {
  id: string;
  type: ExamSectionType;
  title: string;
  instructions: string;
  marks: number;
  questions: ExamQuestion[];
}

export interface ExamPaper {
  id: string;
  title: string;
  topic: TopicSkill;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  difficulty: DifficultyLevel;
  durationMinutes: number;
  totalMarks: number;
  sections: ExamSection[];
  answerScheme: string[];
  markingGuide: string[];
}

export interface AIExamPaperRequest {
  topic: TopicSkill;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  difficulty: DifficultyLevel;
  durationMinutes: number;
  totalMarks: number;
  sections: ExamSectionType[];
}

export type MarkingQuestionType = 'objective' | 'subjective' | 'comprehension' | 'essay' | 'writing';

export interface MarkingQuestionInput {
  id: string;
  type: MarkingQuestionType;
  prompt: string;
  marks: number;
}

export interface AnswerSchemeItem {
  questionId: string;
  type: MarkingQuestionType;
  prompt: string;
  marks: number;
  suggestedAnswer: string;
  rubric: string[];
  markingGuide: string[];
}

export interface MarkingAssistantResult {
  id: string;
  title: string;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  difficulty: DifficultyLevel;
  totalMarks: number;
  items: AnswerSchemeItem[];
  rubric: string[];
  markingGuide: string[];
}

export interface AIAnswerSchemeRequest {
  title: string;
  topic: TopicSkill;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
  difficulty: DifficultyLevel;
  questions: MarkingQuestionInput[];
}
