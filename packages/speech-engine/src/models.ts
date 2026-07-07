export interface PronunciationScore {
  accuracy: number;
  fluency: number;
  confidence: number;
  feedback: string;
}

export interface SpeechRecognitionOptions {
  language: string;
  continuous: boolean;
}

export interface TextToSpeechOptions {
  voice: string;
  rate: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  durationSeconds: number;
}

export interface ReadingAssessmentInput {
  expectedText: string;
  spokenText: string;
  readingDurationSeconds: number;
}

export interface ReadingAssessmentResult {
  accuracy: number;
  fluency: number;
  comprehensionReadiness: number;
  detectedErrors: string[];
  nextSteps: string[];
}

export interface WritingFeedbackResult {
  overallScore: number;
  grammarFeedback: string[];
  structureFeedback: string[];
  vocabularyFeedback: string[];
  revisedSample: string;
}
