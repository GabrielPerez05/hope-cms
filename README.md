# Hope, Inc. Customer Management System

Sprint-based capstone application for managing Hope, Inc. customers and viewing purchase history. Customer records support controlled CRUD behavior with soft removal. Sales, sales detail, product, and price history records are read-only in the app.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, and SQL migrations
- React Router v6
- Vitest + React Testing Library

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and add Supabase credentials:

   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Run checks:

   ```bash
   npm run build
   npm run test
   npm run lint
   ```

## Sprint 1 Outputs

- `src/lib/supabase.ts` initializes the Supabase JS client.
- `src/contexts/AuthContext.tsx` handles sessions, email auth, Google OAuth, login guard, and inactive-account blocking.
- `src/components/ProtectedRoute.tsx` blocks unauthenticated app access.
- `src/components/AppShell.tsx` provides the CMS navbar and sidebar.
- `src/pages` contains Login, Register, Auth Callback, and placeholder CMS pages.
- `db/migrations` contains Sprint 1 SQL for schema, HopeDB seed row counts, rights seed, SUPERADMIN seed, and provisioning trigger.
- `db/verify-seed.sql` checks row counts and foreign key gaps.
- `docs/erd.md`, `docs/github-branching.md`, and `docs/sprint1-log.md` document Sprint 1 outputs.
- `.github/pull_request_template.md` supports reviewed PRs into `dev`.

## Branch Flow

Use `feature/*`, `feat/*`, `db/*`, `test/*`, and `docs/*` branches. Merge feature branches into `dev` by Pull Request after teammate review. Release from `dev` to `main` by Pull Request only.

## Sprint 1 PR Map

- M1: `feat/project-scaffold`, `feat/supabase-client`, `feat/routing-skeleton`, `chore/github-protection`
- M2: `feat/ui-login-page`, `feat/ui-register-page`, `feat/ui-app-shell`, `feat/ui-auth-callback`
- M3: `db/initial-schema`, `db/rights-seed`, `docs/db-erd`, `db/verify-seed`
- M4: `feat/auth-context`, `feat/auth-email`, `feat/auth-google`, `db/trigger-provision-user`
- M5: `test/sprint1-auth-flows`, `docs/sprint1-log-readme`

## Core Rules

- Customer removals must set `record_status = 'INACTIVE'`.
- USER accounts must only see ACTIVE customers.
- ADMIN and SUPERADMIN can see inactive customers and recover them.
- Sales, sales detail, product, and price history views stay read-only for every user type.
- ADMIN must not alter a SUPERADMIN account.
