import type { DifficultyLevel, TopicSkill } from '@eduspell/shared';

export type QuizType = 'multiple-choice' | 'drag-drop' | 'matching' | 'fill-blank' | 'spelling' | 'timed';

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: QuizType;
  difficulty: DifficultyLevel;
  options?: string[];
  answer: string;
  points: number;
}

export interface QuizSession {
  id: string;
  topic: TopicSkill;
  questions: QuizQuestion[];
  timeLimitSeconds: number;
  isTimed: boolean;
}

export interface AIQuizGenerationRequest {
  topic: TopicSkill;
  difficulty: DifficultyLevel;
  questionCount: number;
  quizType: QuizType;
}

export interface SpellingChallengeRequest {
  topic: TopicSkill;
  wordCount: number;
  includeSentenceHints: boolean;
}
