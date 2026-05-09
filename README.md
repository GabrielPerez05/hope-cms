# Hope CMS

Sprint 1 — Weeks 1 & 2: Project setup, full CMS database, Email + Google OAuth, login guard.

## Project overview

- Vite + React 18 + Tailwind CSS front-end
- Supabase JS client with `.env.example`
- React Router v6 with protected routes
- Professional login/register pages with modern split-screen styling
- Placeholder CMS pages: `/customers`, `/sales`, `/products`, `/admin`, `/deleted-customers`, `/auth/callback`
- Auth guard verifies `record_status === 'ACTIVE'`

## Branch strategy

- `dev` is the main development branch
- `main` is the protected production branch
- `feature/*` used for each task or PR
- All changes should go through pull requests

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env`
3. Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. `npm run dev`

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production assets
- `npm run lint` — run ESLint
- `npm run test` — run unit tests

## Supabase

- Use `src/lib/supabase.js` to initialize the client
- Google OAuth and email/password auth are wired through `AuthContext`

## Sprint deliverables

- `db/migrations/001_initial_schema.sql`
- `db/migrations/002_rights_seed.sql`
- `db/migrations/003_auth_provisioning.sql`
- `db/migrations/004_hopedb_seed.sql`
- `docs/erd.md`
- `docs/sprint1-log.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
