export type QuizType = 'multiple-choice' | 'drag-drop' | 'matching' | 'fill-blank' | 'spelling-challenge' | 'timed';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  points: number;
  timed?: boolean;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  feedback: string[];
}

export interface QuizSubmission {
  quizId: string;
  answers: Record<string, string>;
  startedAt: string;
  completedAt: string;
}

export class QuizEngineService {
  autoGrade(question: QuizQuestion, answer: string): boolean {
    if (!question.correctAnswer && !question.acceptableAnswers) return false;
    const acceptedAnswers = [question.correctAnswer, ...(question.acceptableAnswers ?? [])].filter(Boolean);
    return acceptedAnswers.some((value) => value.toLowerCase() === answer.trim().toLowerCase());
  }

  gradeQuiz(questions: QuizQuestion[], submission: QuizSubmission): QuizResult {
    const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
    let earnedPoints = 0;
    const feedback: string[] = [];

    questions.forEach((question) => {
      const answer = submission.answers[question.id] ?? '';
      const isCorrect = this.autoGrade(question, answer);
      if (isCorrect) {
        earnedPoints += question.points;
      } else {
        feedback.push(`Review ${question.prompt}`);
      }
    });

    const percentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
    return {
      score: earnedPoints,
      maxScore: totalPoints,
      percentage,
      passed: percentage >= 70,
      feedback,
    };
  }

  createTimedQuiz(questions: QuizQuestion[], durationSeconds: number): QuizQuestion[] {
    return questions.map((question) => ({ ...question, timed: true }));
  }
}
