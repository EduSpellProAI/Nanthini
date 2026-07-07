# EduSpell Pro AI

A production-ready Turborepo monorepo for the EduSpell Pro AI educational platform.

## Structure

- Apps: student, teacher, parent, admin, marketing
- Shared packages: ui, auth, database, shared, config

## Portals

- Student portal: role `student`
- Teacher portal: role `teacher`
- Parent portal: role `parent`
- Admin portal: role `admin`
- Marketing site: public

## Getting started

1. Install dependencies with pnpm install
2. Start all apps with pnpm dev
3. Open the app ports:
   - Student: http://localhost:3001
   - Teacher: http://localhost:3002
   - Parent: http://localhost:3003
   - Admin: http://localhost:3004
   - Marketing: http://localhost:3005

## Production Verification Commands

- Typecheck: `pnpm typecheck`
- Package builds: `pnpm -r --filter "./packages/*" run build`
- App builds (non-interactive):
   - `pnpm --filter @eduspell/student build`
   - `pnpm --filter @eduspell/teacher build`
   - `pnpm --filter @eduspell/parent build`
   - `pnpm --filter @eduspell/admin build`
   - `pnpm --filter @eduspell/marketing build`
- Full workspace build: `pnpm build`

Note: `next lint` is interactive when ESLint is not initialized in an app. For this repository, lint initialization is intentionally skipped until a shared ESLint config is added.

## Firebase Integration

- Client SDK config is read from root `.env` values defined in `.env.example`.
- Firebase package exports helper APIs from `packages/firebase/src/index.ts`.
- Cloud Functions are in `functions/src/index.ts` and compile with `pnpm --filter eduspell-functions build`.
- Firestore and Storage security rules live in:
   - `firebase/firestore.rules`
   - `firebase/storage.rules`

## Security And Hardening

- Portal route protection is enforced by per-app middleware files under each app.
- API routes enforce role checks via `eduspell_role` cookie validation.
- Production headers are configured via app `next.config.ts` files.
- `poweredByHeader` is disabled and standalone output is enabled for production runtime packaging.

## Documentation

- Environment setup: `docs/environment-setup.md`
- Deployment guide: `docs/deployment-guide.md`