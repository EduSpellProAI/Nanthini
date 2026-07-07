import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { isFirebaseConfigured, readFirebaseClientConfig } from './config';

let app: FirebaseApp | null = null;
let emulatorsConnected = false;

function readEnv(key: string): string {
  const envObject = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return envObject?.[key] ?? '';
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase environment variables are missing.');
  }

  if (!app) {
    app = getApps().length ? getApp() : initializeApp(readFirebaseClientConfig());
  }

  return app;
}

function connectEmulatorsIfEnabled() {
  if (emulatorsConnected || readEnv('NEXT_PUBLIC_USE_FIREBASE_EMULATORS') !== 'true') {
    return;
  }

  const firebaseApp = getFirebaseApp();
  connectAuthEmulator(getAuth(firebaseApp), 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(getFirestore(firebaseApp), '127.0.0.1', 8080);
  connectStorageEmulator(getStorage(firebaseApp), '127.0.0.1', 9199);
  connectFunctionsEmulator(getFunctions(firebaseApp), '127.0.0.1', 5001);
  emulatorsConnected = true;
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp();
  connectEmulatorsIfEnabled();
  return getAuth(firebaseApp);
}

export function getFirebaseFirestore() {
  const firebaseApp = getFirebaseApp();
  connectEmulatorsIfEnabled();
  return getFirestore(firebaseApp);
}

export function getFirebaseStorage() {
  const firebaseApp = getFirebaseApp();
  connectEmulatorsIfEnabled();
  return getStorage(firebaseApp);
}

export function getFirebaseFunctions() {
  const firebaseApp = getFirebaseApp();
  connectEmulatorsIfEnabled();
  return getFunctions(firebaseApp);
}

export async function callFirebaseFunction<TRequest, TResponse>(name: string, data: TRequest): Promise<TResponse> {
  const callable = httpsCallable<TRequest, TResponse>(getFirebaseFunctions(), name);
  const result = await callable(data);
  return result.data;
}
