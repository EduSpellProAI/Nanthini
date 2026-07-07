export type StudentAbilityLevel = 'beginner' | 'developing' | 'confident' | 'advanced';

export interface StudentAbilityProfile {
  studentId: string;
  currentLevel: StudentAbilityLevel;
  strengths: string[];
  weaknesses: string[];
  masteryScore: number;
  recentAttempts: number;
}

export interface LearningPathStep {
  id: string;
  title: string;
  skill: string;
  difficulty: number;
  estimatedMinutes: number;
  type: 'lesson' | 'quiz' | 'practice';
}

export interface AdaptiveLearningRecommendation {
  studentId: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  suggestedSteps: LearningPathStep[];
}

export class AdaptiveLearningService {
  detectAbility(profile: StudentAbilityProfile): StudentAbilityLevel {
    if (profile.masteryScore >= 85 && profile.recentAttempts >= 5) return 'advanced';
    if (profile.masteryScore >= 65) return 'confident';
    if (profile.masteryScore >= 40) return 'developing';
    return 'beginner';
  }

  adjustDifficulty(profile: StudentAbilityProfile, baseDifficulty: number): number {
    const level = this.detectAbility(profile);
    const multipliers: Record<StudentAbilityLevel, number> = {
      beginner: 0.8,
      developing: 0.95,
      confident: 1.05,
      advanced: 1.2,
    };

    return Math.max(1, Math.round(baseDifficulty * multipliers[level]));
  }

  generateLearningPath(profile: StudentAbilityProfile): LearningPathStep[] {
    const level = this.detectAbility(profile);
    const baseSteps: LearningPathStep[] = [
      { id: 's1', title: 'Warm-up vocabulary', skill: 'spelling', difficulty: 2, estimatedMinutes: 10, type: 'lesson' },
      { id: 's2', title: 'Focus practice', skill: 'pronunciation', difficulty: 3, estimatedMinutes: 12, type: 'quiz' },
      { id: 's3', title: 'Review challenge', skill: 'fluency', difficulty: 4, estimatedMinutes: 15, type: 'practice' },
    ];

    return baseSteps.map((step) => ({
      ...step,
      difficulty: this.adjustDifficulty(profile, step.difficulty),
      title: level === 'beginner' ? `Foundations: ${step.title}` : step.title,
    }));
  }

  trackMastery(profile: StudentAbilityProfile, scoreDelta: number): number {
    const nextScore = Math.min(100, Math.max(0, profile.masteryScore + scoreDelta));
    return Number(nextScore.toFixed(1));
  }

  recommend(profile: StudentAbilityProfile): AdaptiveLearningRecommendation {
    const level = this.detectAbility(profile);
    const suggestedSteps = this.generateLearningPath(profile);
    const message =
      level === 'beginner'
        ? 'Start with foundational practice and short confidence-building activities.'
        : 'Move into slightly more complex tasks to keep engagement high.';

    return {
      studentId: profile.studentId,
      message,
      priority: level === 'advanced' ? 'medium' : 'high',
      suggestedSteps,
    };
  }
}
