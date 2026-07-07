export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

function readEnv(key: string): string {
  const envObject = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return envObject?.[key] ?? '';
}

export function readFirebaseClientConfig(): FirebaseClientConfig {
  return {
    apiKey: readEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: readEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
    measurementId: readEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID') || undefined,
  };
}

export function isFirebaseConfigured(): boolean {
  const config = readFirebaseClientConfig();
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId
  );
}
