import { aiTelemetryService, geminiClient } from '@eduspell/ai-core';
import { FirestoreRepository } from '@eduspell/database';
import { clamp, createId, roundTo } from '@eduspell/shared';
import type {
  PronunciationScore,
  ReadingAssessmentInput,
  ReadingAssessmentResult,
  SpeechRecognitionOptions,
  SpeechRecognitionResult,
  TextToSpeechOptions,
  WritingFeedbackResult,
} from './models';

interface SpeechAssessmentRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  assessmentType: 'pronunciation' | 'reading' | 'writing';
  payload: unknown;
}

export class SpeechRecognitionWrapper {
  async recognize(options: SpeechRecognitionOptions): Promise<SpeechRecognitionResult> {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      const RecognitionClass = (window as unknown as { SpeechRecognition: new () => SpeechRecognition }).SpeechRecognition;
      const recognition = new RecognitionClass();
      recognition.lang = options.language;
      recognition.continuous = options.continuous;

      return new Promise((resolve, reject) => {
        const startedAt = Date.now();
        recognition.onerror = (event) => reject(new Error(`Speech recognition failed: ${event.error}`));
        recognition.onresult = (event) => {
          const alternative = event.results[0]?.[0];
          if (!alternative) {
            reject(new Error('Speech recognition returned no alternatives.'));
            return;
          }

          resolve({
            transcript: alternative.transcript,
            confidence: roundTo(alternative.confidence || 0.7, 2),
            durationSeconds: roundTo((Date.now() - startedAt) / 1000, 2),
          });
        };

        recognition.start();
      });
    }

    throw new Error('SpeechRecognition API is unavailable in this runtime environment.');
  }
}

export class TextToSpeechWrapper {
  speak(text: string, options: TextToSpeechOptions): Promise<string> {
    return Promise.resolve(`Speaking: ${text} with ${options.voice}`);
  }
}

export class PronunciationScorer {
  private readonly repository = new FirestoreRepository<SpeechAssessmentRecord>('learningProgress');

  async score(studentId: string, expectedText: string, spokenText: string): Promise<PronunciationScore> {
    const lexicalAccuracy = clamp(
      100 - Math.abs(expectedText.length - spokenText.length) * 1.5,
      0,
      100
    );

    const analysis = await geminiClient.generateJson(
      {
        feature: 'pronunciation-scoring',
        systemPrompt:
          'Evaluate pronunciation quality. Return JSON with numeric fields fluency and confidence (0-100) and a string field feedback.',
        userPrompt: JSON.stringify({ expectedText, spokenText, lexicalAccuracy }),
        temperature: 0.2,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const fluency = Number(source.fluency);
          const confidence = Number(source.confidence);
          const feedback = String(source.feedback ?? '').trim();

          if (Number.isNaN(fluency) || Number.isNaN(confidence) || !feedback) {
            throw new Error('Invalid pronunciation scoring payload from AI model.');
          }

          return { fluency, confidence, feedback };
        },
      }
    );

    const score: PronunciationScore = {
      accuracy: roundTo(lexicalAccuracy, 2),
      fluency: roundTo(clamp(analysis.data.fluency, 0, 100), 2),
      confidence: roundTo(clamp(analysis.data.confidence, 0, 100), 2),
      feedback: analysis.data.feedback,
    };

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      studentId,
      assessmentType: 'pronunciation',
      payload: score,
    });

    await aiTelemetryService.log({
      feature: 'pronunciation-scoring',
      model: analysis.model,
      promptHash: analysis.promptHash,
      responsePreview: JSON.stringify(score).slice(0, 350),
      latencyMs: analysis.latencyMs,
      createdAt: now,
      metadata: { studentId },
    });

    return score;
  }
}

export class ReadingAssessmentService {
  private readonly repository = new FirestoreRepository<SpeechAssessmentRecord>('learningProgress');

  async assess(studentId: string, input: ReadingAssessmentInput): Promise<ReadingAssessmentResult> {
    const analysis = await geminiClient.generateJson(
      {
        feature: 'ai-reading-assessment',
        systemPrompt:
          'Assess reading output. Return JSON fields: accuracy, fluency, comprehensionReadiness (0-100), detectedErrors (string[]), nextSteps (string[]).',
        userPrompt: JSON.stringify(input),
        temperature: 0.2,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const detectedErrors = Array.isArray(source.detectedErrors)
            ? source.detectedErrors.map((item) => String(item))
            : [];
          const nextSteps = Array.isArray(source.nextSteps) ? source.nextSteps.map((item) => String(item)) : [];

          return {
            accuracy: roundTo(clamp(Number(source.accuracy), 0, 100), 2),
            fluency: roundTo(clamp(Number(source.fluency), 0, 100), 2),
            comprehensionReadiness: roundTo(clamp(Number(source.comprehensionReadiness), 0, 100), 2),
            detectedErrors,
            nextSteps,
          };
        },
      }
    );

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      studentId,
      assessmentType: 'reading',
      payload: analysis.data,
    });

    await aiTelemetryService.log({
      feature: 'ai-reading-assessment',
      model: analysis.model,
      promptHash: analysis.promptHash,
      responsePreview: JSON.stringify(analysis.data).slice(0, 350),
      latencyMs: analysis.latencyMs,
      createdAt: now,
      metadata: { studentId, duration: input.readingDurationSeconds },
    });

    return analysis.data;
  }
}

export class WritingFeedbackService {
  private readonly repository = new FirestoreRepository<SpeechAssessmentRecord>('learningProgress');

  async evaluate(studentId: string, writingText: string, assignmentPrompt: string): Promise<WritingFeedbackResult> {
    const analysis = await geminiClient.generateJson(
      {
        feature: 'ai-writing-feedback',
        systemPrompt:
          'Provide writing feedback. Return JSON with fields overallScore (0-100), grammarFeedback(string[]), structureFeedback(string[]), vocabularyFeedback(string[]), revisedSample(string).',
        userPrompt: JSON.stringify({ writingText, assignmentPrompt }),
        temperature: 0.25,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const toStringArray = (field: string): string[] =>
            Array.isArray(source[field]) ? source[field].map((item) => String(item)).filter((item) => item.trim().length > 0) : [];

          return {
            overallScore: roundTo(clamp(Number(source.overallScore), 0, 100), 2),
            grammarFeedback: toStringArray('grammarFeedback'),
            structureFeedback: toStringArray('structureFeedback'),
            vocabularyFeedback: toStringArray('vocabularyFeedback'),
            revisedSample: String(source.revisedSample ?? '').trim(),
          };
        },
      }
    );

    if (!analysis.data.revisedSample) {
      throw new Error('AI writing feedback returned an empty revisedSample.');
    }

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      studentId,
      assessmentType: 'writing',
      payload: analysis.data,
    });

    await aiTelemetryService.log({
      feature: 'ai-writing-feedback',
      model: analysis.model,
      promptHash: analysis.promptHash,
      responsePreview: JSON.stringify(analysis.data).slice(0, 350),
      latencyMs: analysis.latencyMs,
      createdAt: now,
      metadata: { studentId, textLength: writingText.length },
    });

    return analysis.data;
  }
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    start(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  }

  interface SpeechRecognitionEvent {
    results: Array<Array<{ transcript: string; confidence: number }>>;
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }
}
