# Hope CMS

Sprint 1 - Weeks 1 & 2: Project setup, full CMS database, Email + Google OAuth, login guard.

## Project overview

- Vite + React 18 + Tailwind CSS front-end
- Supabase JS client with `.env.example`
- React Router v6 with protected routes
- Professional login/register pages with modern split-screen styling
- Placeholder CMS pages: `/customers`, `/sales`, `/products`, `/admin`, `/deleted-customers`, `/auth/callback`
- Auth guard verifies `record_status === 'ACTIVE'`

## Sprint 1 - Weeks 1 & 2

**Theme:** Project setup, full CMS database with 82 customers, 124 sales, 52 products, Email + Google OAuth, and login guard.

| Sprint | Focus | Weeks | Team Total | Average / Member |
| --- | --- | --- | --- | --- |
| 1 | Project Setup, CMS Database & Authentication | 1-2 | 18 PRs | 4 PRs |

### M1 - Project Lead / Full-Stack Developer

Minimum PRs: 4

Expected outputs:

- GitHub repo created with branching strategy (`main`, `dev`, `feature/*`) documented in README
- Vite + React 18 + Tailwind CSS scaffolded and running locally
- Supabase JS client initialized; `.env.example` committed to repo
- React Router v6 with `ProtectedRoute` blocking unauthenticated access
- All placeholder pages wired: `/customers`, `/sales`, `/products`, `/admin`, `/deleted-customers`, `/auth/callback`
- `dev` and `main` branches protected in GitHub with no direct pushes and PRs required

Pull requests:

- PR-01 `feat/project-scaffold` - Vite + React + Tailwind initial setup
- PR-02 `feat/supabase-client` - Supabase JS client init + `.env` config
- PR-03 `feat/routing-skeleton` - All CMS routes, `ProtectedRoute`, placeholder pages
- PR-04 `chore/github-protection` - Branch protection rules + PR template

### M2 - Frontend Developer (UI/UX)

Minimum PRs: 4

Expected outputs:

- Login page with email/password form, "Sign in with Google" button, form validation, and clear error messages
- Register page with First Name, Last Name, Username, Email, Password fields, and Google register button
- App shell layout with Navbar, user display, logout, and Sidebar CMS links for Customers, Sales, Products, Admin, and Deleted Customers
- `/auth/callback` page with loading spinner during OAuth session exchange
- Responsive pages across mobile and desktop

Pull requests:

- PR-01 `feat/ui-login-page` - Login form with email + Google OAuth button
- PR-02 `feat/ui-register-page` - Registration form with validation
- PR-03 `feat/ui-app-shell` - Navbar, CMS sidebar, layout wrapper
- PR-04 `feat/ui-auth-callback` - `/auth/callback` loading page

### M3 - Backend / Database Engineer

Minimum PRs: 4

Expected outputs:

- Supabase project created; URL and anon key shared via `.env.example`
- All 5 HopeDB tables seeded: `customer` (82 rows), `sales` (124 rows), `salesDetail` (~250 rows), `product` (52 rows), `priceHist` (~70 rows)
- Rights scripts executed: `user`, `Module`, `user_module`, `rights`, `UserModule_Rights` tables seeded
- `record_status` defaulting to `ACTIVE` and stamp columns added to customer table only; other tables unchanged
- 4 modules seeded: `Cust_Mod`, `Sales_Mod`, `Prod_Mod`, `Adm_Mod`
- 9 rights seeded: `CUST_VIEW`, `CUST_ADD`, `CUST_EDIT`, `CUST_DEL`, `SALES_VIEW`, `SD_VIEW`, `PROD_VIEW`, `PRICE_VIEW`, `ADM_USER`
- SUPERADMIN seeded: `jcesperanza@neu.edu.ph`, all 9 rights set to `1`
- All SQL committed to `db/migrations`; ERD committed to `docs`

Pull requests:

- PR-01 `db/initial-schema` - HopeDB 5 tables + `record_status` and stamp columns on customer only
- PR-02 `db/rights-seed` - 4 modules + 9 rights + SUPERADMIN seed
- PR-03 `docs/db-erd` - ERD diagram showing 5 table relationships
- PR-04 `db/verify-seed` - SQL verification queries for row counts and FK checks

### M4 - Rights & Authentication Specialist

Minimum PRs: 4

Expected outputs:

- `AuthContext.jsx` wraps app and provides `currentUser` state via `onAuthStateChange`
- Email/password auth with `supabase.auth.signUp()` and `signIn()` wired to Register and Login forms
- Google OAuth with `supabase.auth.signInWithOAuth({ provider: 'google' })` wired to Google buttons
- `/auth/callback` route processes OAuth redirect, runs login guard, and navigates to `/customers` or `/login?error`
- Login guard checks `record_status = 'ACTIVE'` on every `SIGNED_IN` event and signs out with an error if inactive
- `provision_new_user()` trigger fires on `auth.users` insert; creates USER/INACTIVE row; inserts 4 module rows; inserts 9 rights rows
- Default provisioned rights: `CUST_VIEW`, `SALES_VIEW`, `SD_VIEW`, `PROD_VIEW`, and `PRICE_VIEW` set to `1`; add/edit/delete/admin rights set to `0`
- Google OAuth configured in Google Cloud Console and Supabase Dashboard with redirect URLs for localhost and production

Pull requests:

- PR-01 `feat/auth-context` - `AuthContext`, session listener, `currentUser` state
- PR-02 `feat/auth-email` - `signUp()` + `signIn()` wired to Login/Register forms
- PR-03 `feat/auth-google` - `signInWithOAuth` + `/auth/callback` + redirect URLs
- PR-04 `db/trigger-provision-user` - `provision_new_user()` trigger with CMS rights defaults

### M5 - QA / Documentation Specialist

Minimum PRs: 2

Expected outputs:

- Vitest + React Testing Library installed and configured
- Test cases written and executed for email registration, Google OAuth new user flow, login guard blocking inactive users, and login guard allowing active users
- Sprint 1 log completed with dates, tasks done, blockers, resolutions, and next sprint goals
- README updated with clone, `npm install`, `.env` setup, `npm run dev`, and Supabase project URL

Pull requests:

- PR-01 `test/sprint1-auth-flows` - Email + Google OAuth + login guard test cases
- PR-02 `docs/sprint1-log-readme` - Sprint 1 log + README instructions

## Branch strategy

- `dev` is the main development branch
- `main` is the protected production branch
- `feature/*` used for each task or PR
- All changes should go through pull requests

## Local setup

1. Clone the repository:

   ```bash
   git clone https://github.com/GabrielPerez05/hope-cms.git
   cd hope-cms
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment example file:

   ```bash
   cp .env.example .env
   ```

4. Add the Supabase credentials to `.env`:

   ```env
   VITE_SUPABASE_URL=https://vxpeuscujtcfzowokmsr.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

## Supabase project

- Project URL: `https://vxpeuscujtcfzowokmsr.supabase.co`

## Scripts

- `npm run dev` - start development server
- `npm run build` - build production assets
- `npm run lint` - run ESLint
- `npm run test` - run unit tests

## Supabase

- Use `src/lib/supabase.js` to initialize the client
- Google OAuth and email/password auth are wired through `AuthContext`

## Database implementation notes

- The running app uses `public."user"`, `public.user_module`, and `public.user_rights` for profile, module, and rights data.
- Rights columns are `"userId"`, `right_name`, and `right_value`.
- RLS scripts use Supabase `auth.uid()` and the app's actual rights tables.
- `initial_schema.sql` still includes support/source-data tables used by the seed relationships and verification checks: `employee`, `department`, `job`, `jobHistory`, and `payment`.

## Sprint deliverables

- `db/migrations/initial_schema.sql`
- `db/migrations/rights_seed.sql`
- `db/migrations/verify_seed.sql`
- `docs/db-erd.png`
- `docs/sprint1-log.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
