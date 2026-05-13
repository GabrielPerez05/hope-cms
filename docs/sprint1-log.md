# Sprint 1 Log

## Sprint goal

Project setup, CMS database seed, authentication, and login guard implementation.

## Completed tasks

- Scaffolded Vite + React 18 + Tailwind CSS application
- Added Supabase client and `.env.example`
- Built React Router skeleton and `ProtectedRoute`
- Created placeholder pages for `/customers`, `/sales`, `/products`, `/admin`, `/deleted-customers`, and `/auth/callback`
- Implemented `AuthContext` with email/password and Google OAuth flows
- Added login guard to verify `record_status` before allowing signed-in access
- Committed database migration SQL files and sample ERD

## Blockers

- Supabase project credentials must be added to `.env`
- Database seed counts are noted in SQL scripts; actual Supabase seeding should be run in a dedicated environment

## Next sprint goals

- Build actual CMS data tables in the UI
- Add detailed rights-based page access
- Add user/role management and admin screens
