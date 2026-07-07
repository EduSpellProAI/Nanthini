export * from './models';
export * from './repository';
export * from './firestore';
export * from './storage';

export function getDatabaseClient() {
  return 'firebase-firestore';
}
