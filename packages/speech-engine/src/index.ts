export interface PronunciationScore {
  accuracy: number;
  fluency: number;
  confidence: number;
  feedback: string[];
}

export interface SpeechRecognitionLike {
  start(): void;
  stop(): void;
  onResult(callback: (transcript: string) => void): void;
}

export interface TextToSpeechLike {
  speak(text: string): void;
  stop(): void;
}

export class PronunciationScorer {
  score(transcript: string, expected: string): PronunciationScore {
    const expectedWords = expected.trim().split(/\s+/).length;
    const actualWords = transcript.trim().split(/\s+/).length;
    const accuracy = Math.min(100, Math.round((Math.min(expectedWords, actualWords) / Math.max(expectedWords, 1)) * 100));
    const fluency = transcript.length > 0 ? 85 : 50;
    const confidence = Math.min(100, accuracy + 5);

    return {
      accuracy,
      fluency,
      confidence,
      feedback: transcript.toLowerCase().includes(expected.toLowerCase()) ? ['Great pronunciation.'] : ['Try again and focus on the target word.'],
    };
  }
}

export class SpeechRecognitionWrapper implements SpeechRecognitionLike {
  private handler?: (transcript: string) => void;

  start(): void {
    this.handler?.('');
  }

  stop(): void {
    // no-op placeholder for browser integration
  }

  onResult(callback: (transcript: string) => void): void {
    this.handler = callback;
  }
}

export class TextToSpeechWrapper implements TextToSpeechLike {
  speak(text: string): void {
    console.info(`TTS: ${text}`);
  }

  stop(): void {
    // no-op placeholder for browser integration
  }
}
