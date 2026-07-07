import type { DifficultyLevel, StudentProfile, TopicSkill } from '@eduspell/shared';

export interface LearningPathStep {
  topic: TopicSkill;
  targetDifficulty: DifficultyLevel;
  estimatedDuration: number;
}

export interface StudentAbilitySnapshot {
  studentId: string;
  profile: StudentProfile;
  confidence: number;
  recommendedDifficulty: DifficultyLevel;
}

export interface MasteryRecord {
  studentId: string;
  topicId: string;
  masteryScore: number;
  lastUpdated: string;
}

export interface ProgressPrediction {
  studentId: string;
  predictedMasteryIn30Days: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  recommendedInterventions: string[];
}
