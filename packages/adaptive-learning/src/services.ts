import { aiTelemetryService, geminiClient } from '@eduspell/ai-core';
import { FirestoreRepository } from '@eduspell/database';
import type { AssessmentResult, DifficultyLevel, StudentProfile, TopicSkill } from '@eduspell/shared';
import { clamp, roundTo } from '@eduspell/shared';
import type { LearningPathStep, MasteryRecord, ProgressPrediction, StudentAbilitySnapshot } from './models';

interface LearningProgressRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  payload: unknown;
}

export class AdaptiveLearningService {
  private readonly repository = new FirestoreRepository<LearningProgressRecord>('learningProgress');

  detectAbility(student: StudentProfile, recentResults: AssessmentResult[]): StudentAbilitySnapshot {
    const averageScore = recentResults.length
      ? recentResults.reduce((sum, result) => sum + result.score, 0) / recentResults.length
      : student.masteryScore;

    const confidence = clamp(averageScore / 100, 0.1, 1);
    const recommendedDifficulty: DifficultyLevel = confidence > 0.8 ? 'advanced' : confidence > 0.55 ? 'intermediate' : 'beginner';

    return {
      studentId: student.id,
      profile: student,
      confidence: roundTo(confidence, 2),
      recommendedDifficulty,
    };
  }

  adjustDifficulty(currentDifficulty: DifficultyLevel, masteryScore: number): DifficultyLevel {
    if (masteryScore >= 85) return 'advanced';
    if (masteryScore >= 65) return 'intermediate';
    return 'beginner';
  }

  generateLearningPath(student: StudentProfile, topics: TopicSkill[]): LearningPathStep[] {
    const baseDifficulty = this.adjustDifficulty(student.currentLevel, student.masteryScore);

    return topics.map((topic) => ({
      topic,
      targetDifficulty: this.adjustDifficulty(baseDifficulty, student.masteryScore),
      estimatedDuration: 12 + topic.name.length,
    }));
  }

  trackMastery(studentId: string, topicId: string, score: number): MasteryRecord {
    return {
      studentId,
      topicId,
      masteryScore: roundTo(score, 2),
      lastUpdated: new Date().toISOString(),
    };
  }

  generateRecommendations(student: StudentProfile, topics: TopicSkill[]): TopicSkill[] {
    return topics.filter((topic) => !student.weaknesses.includes(topic.name));
  }

  async predictProgress(student: StudentProfile, recentResults: AssessmentResult[]): Promise<ProgressPrediction> {
    const recencyWeightedScore = recentResults.length
      ? recentResults.reduce((sum, result, index) => sum + result.score * (index + 1), 0) /
        recentResults.reduce((sum, _result, index) => sum + (index + 1), 0)
      : student.masteryScore;

    const historicalVolatility = recentResults.length
      ? recentResults.reduce((sum, item) => sum + Math.abs(item.score - recencyWeightedScore), 0) / recentResults.length
      : 0;

    const baselinePrediction = clamp(recencyWeightedScore + (student.strengths.length - student.weaknesses.length) * 2, 25, 98);
    const riskLevel: ProgressPrediction['riskLevel'] = baselinePrediction >= 80 ? 'low' : baselinePrediction >= 60 ? 'medium' : 'high';
    const confidence = clamp(1 - historicalVolatility / 100, 0.35, 0.95);

    const aiGuidance = await geminiClient.generateJson(
      {
        feature: 'student-progress-prediction',
        systemPrompt:
          'You are an adaptive learning scientist. Return JSON with field recommendedInterventions (string array) only. Keep suggestions actionable and measurable.',
        userPrompt: JSON.stringify({
          student,
          baselinePrediction,
          riskLevel,
          confidence,
          recentResults,
        }),
        temperature: 0.2,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const interventions = Array.isArray(source.recommendedInterventions)
            ? source.recommendedInterventions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            : [];

          if (!interventions.length) {
            throw new Error('AI output missing recommendedInterventions.');
          }

          return interventions;
        },
      }
    );

    const prediction: ProgressPrediction = {
      studentId: student.id,
      predictedMasteryIn30Days: roundTo(baselinePrediction, 2),
      riskLevel,
      confidence: roundTo(confidence, 2),
      recommendedInterventions: aiGuidance.data,
    };

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      studentId: student.id,
      payload: prediction,
    });

    await aiTelemetryService.log({
      feature: 'student-progress-prediction',
      model: aiGuidance.model,
      promptHash: aiGuidance.promptHash,
      responsePreview: JSON.stringify(prediction).slice(0, 350),
      latencyMs: aiGuidance.latencyMs,
      createdAt: now,
      metadata: { studentId: student.id, recentResults: recentResults.length },
    });

    return prediction;
  }
}
