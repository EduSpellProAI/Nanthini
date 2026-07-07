# Environment Setup

## Prerequisites

- Node.js 20.x (recommended by project engines)
- pnpm 9.x
- Firebase project with Auth, Firestore, Storage, and Functions enabled

## Install

```bash
pnpm install
```

## Configure Environment Variables

Copy the root example and set values:

```bash
cp .env.example .env
```

Required root variables:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

Optional root variables:

- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- NEXT_PUBLIC_USE_FIREBASE_EMULATORS
- NEXT_PUBLIC_STUDENT_PORTAL_URL
- NEXT_PUBLIC_TEACHER_PORTAL_URL
- NEXT_PUBLIC_PARENT_PORTAL_URL
- NEXT_PUBLIC_ADMIN_PORTAL_URL

For Cloud Functions, copy:

```bash
cp functions/.env.example functions/.env
```

Functions variables:

- GCLOUD_PROJECT
- FIREBASE_CONFIG

## Local Development

Run all apps:

```bash
pnpm dev
```

Port mapping:

- Student: 3001
- Teacher: 3002
- Parent: 3003
- Admin: 3004
- Marketing: 3005

## Firebase Emulator (Optional)

Set:

- NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true

Emulator endpoints expected by app code:

- Auth: 127.0.0.1:9099
- Firestore: 127.0.0.1:8080
- Storage: 127.0.0.1:9199
- Functions: 127.0.0.1:5001

## Verification Checklist

1. pnpm typecheck
2. pnpm -r --filter "./packages/*" run build
3. pnpm --filter @eduspell/student build
4. pnpm --filter @eduspell/teacher build
5. pnpm --filter @eduspell/parent build
6. pnpm --filter @eduspell/admin build
7. pnpm --filter @eduspell/marketing build
8. pnpm build
