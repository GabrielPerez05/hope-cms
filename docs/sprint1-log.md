# Sprint 1 Log

<<<<<<< HEAD
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
    
=======
## Goal

Project scaffold, Supabase setup files, authentication shell, routing, database migrations, and starter tests.

## Completed Locally

- Vite React TypeScript app configured with Tailwind CSS.
- Supabase client added with `.env.example`.
- React Router routes added for login, registration, callback, customers, sales, products, admin, and deleted customers.
- Auth context added with email/password, Google OAuth, session guard, and inactive-account blocking.
- SQL migrations added for the five HopeDB tables, rights tables, SUPERADMIN seed, provisioning trigger, and HopeDB seed row counts.
- Basic UI tests added for login and registration forms.
- Branching guide and PR template added.

## Pending External Setup

- Create the Supabase project and paste live values into `.env`.
- Configure Google OAuth in Google Cloud and Supabase.
- Protect `main` and `dev` branches in GitHub settings.
>>>>>>> 535af6926ae60f228da74f82990a30ff8a584b19
