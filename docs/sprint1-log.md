# Sprint 1 Log

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

## Member Contributions

| Member | Role | Sprint 1 Deliverable |
|--------|------|----------------------|
| M1 Gabriel Red Ray Perez | Supabase & API | Supabase client singleton, customer-api skeleton |
| M2 Timothy John Gandeza | UI Pages | LoginPage, RegisterPage, AppShell layout |
| M3 Lars Ulrich Galamiton | Database | initial_schema.sql, rights_seed.sql migrations |
| M4 Rhyian Joshua Ticbobolan | Auth Context | AuthContext with session lifecycle and login guard |
| M5 Clark Kent Zuñiga | Tests | sprint1-auth-flows.test.jsx (8 test cases) |

## Test Results

All 8 Sprint 1 test cases pass:
- Google OAuth PKCE flow initiation
- Email verification signup flow
- Active session persistence through AuthProvider
- Inactive login guard (signs out + surfaces error)
- OAuth callback code exchange → /customers redirect
- Inactive OAuth callback → /login?error= redirect
- Unauthenticated route protection
- Rights context loading on session
