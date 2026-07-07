import { getFirebaseFirestore } from '@eduspell/firebase';
import { addDoc, collection } from 'firebase/firestore';
import type { AIGenerationTrace } from './types';

export class AITelemetryService {
  private getDb() {
    return getFirebaseFirestore();
  }

  async log(trace: AIGenerationTrace): Promise<void> {
    await addDoc(collection(this.getDb(), 'aiGenerations'), trace);
  }
}

export const aiTelemetryService = new AITelemetryService();
