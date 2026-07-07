# Deployment Guide

## Production Build Strategy

This repository is a Turborepo workspace. Production build uses:

```bash
pnpm build
```

The root build script uses reduced concurrency for stability in constrained environments.

## Build Steps

1. Install dependencies:

```bash
pnpm install --frozen-lockfile
```

2. Validate types:

```bash
pnpm typecheck
```

3. Build packages:

```bash
pnpm -r --filter "./packages/*" run build
```

4. Build apps individually (recommended in CI logs):

```bash
pnpm --filter @eduspell/student build
pnpm --filter @eduspell/teacher build
pnpm --filter @eduspell/parent build
pnpm --filter @eduspell/admin build
pnpm --filter @eduspell/marketing build
```

5. Run full workspace build:

```bash
pnpm build
```

## Runtime Security

- Each portal has role-enforcing middleware.
- API endpoints validate role cookie access before processing.
- Next.js security headers are configured in every app:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
- poweredByHeader is disabled.

## Firebase Deployment Notes

- Ensure production Firebase config values are present in environment variables.
- Deploy Firestore and Storage rules from `firebase/`.
- Build Cloud Functions before deploy:

```bash
pnpm --filter eduspell-functions build
```

- Deploy functions/rules using Firebase CLI from your CI/CD environment.

## CI Recommendations

- Use Node.js 20.x to match engine expectations.
- Cache pnpm store and Turborepo cache between runs.
- Keep lint disabled in CI until shared ESLint config is initialized across apps, because `next lint` currently prompts interactively in uninitialized apps.

## Release Checklist

1. Environment variables configured for all portals and functions.
2. Firebase rules reviewed and deployed.
3. Typecheck and build checks pass.
4. Role-based login validated for student/teacher/parent/admin portals.
5. Smoke-test API routes for role protections.
6. Confirm monitoring and logging in production platform.
