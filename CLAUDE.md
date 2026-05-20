# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Vitest (all tests, no watch)
npx vitest run src/test/<file>.test.jsx  # Run a single test file
```

## Environment

Copy `.env.example` to `.env` (or `.env.local`) and fill in:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`)

## Architecture

**Stack:** React 18 + Vite, React Router v6, Tailwind CSS v4, Supabase (PostgreSQL + Auth).

### Auth & Session Flow

`AuthContext.jsx` wraps the whole app and manages the Supabase session. On every sign-in it calls `fetchAppUser()` to load the user's row from the public `"user"` table, then runs a **login guard**: if `record_status !== 'ACTIVE'` it immediately calls `signOut()` and surfaces an error — INACTIVE users cannot sign in. `currentUser` is the merged object: `{ id, email, username, user_type, record_status }`.

`useAuth` hook is the consumer. It is re-exported from two paths (`src/hooks/useAuth.js` and `src/contexts/auth-context.js`) — always import from `../hooks/useAuth`.

### RBAC — User Types and Rights

Three user types: `USER`, `ADMIN`, `SUPERADMIN`.

Nine granular rights stored in `user_rights` table (`right_value` is 0/1 integer):
`CUST_VIEW`, `CUST_ADD`, `CUST_EDIT`, `CUST_DEL`, `SALES_VIEW`, `SD_VIEW`, `PROD_VIEW`, `PRICE_VIEW`, `ADM_USER`

`UserRightsContext.jsx` loads all 9 rights on login via a Supabase query. Exposes `{ rights, userType, hasRight(name), canEdit(), isAdmin(), loadUserRights }`. Consume via `useRights()` from `src/hooks/useRights.js`.

**Important right rules:**
- `CUST_DEL` — only SUPERADMIN should have `right_value = 1`. ADMIN must have 0.
- Soft-delete (`CUST_DEL`) is gated in UI as: `userType === "SUPERADMIN" && hasRight("CUST_DEL")`.
- `ADM_USER` right grants access to the Admin sidebar link (non-admin user type with this right can see it).

### Context Re-export Shim

`src/contexts/user-rights-context.js` simply re-exports `useRights` from the hook. `CustomersPage` imports from there. This is intentional — both paths resolve to the same hook.

### Route Structure (`App.jsx`)

```
/login, /register, /auth/callback  — public
/ (AppShell)                       — protected (ProtectedRoute checks currentUser)
  /customers                       — CustomersPage
  /customers/:custNo               — CustomerDetailPage
  /sales                           — SalesPage
  /products                        — ProductsPage
  /admin                           — AdminPage (visible to ADMIN/SUPERADMIN or ADM_USER right)
  /deleted-customers               — DeletedCustomersPage (AdminOnlyRoute: ADMIN/SUPERADMIN only)
```

`AdminOnlyRoute` (in `App.jsx`) redirects non-admins to `/customers`.

### API Layer (`src/lib/`)

- `customer-api.js` — CRUD for customer table. `softDeleteCustomer` sets `record_status = 'INACTIVE'` — **never uses DELETE**.
- `sales-product-api.js` — read-only queries for sales, salesdetail, product, pricehist tables.
- `admin-api.js` — user management: `getAdminUsers()`, `updateAdminUser()`, `updateUserModule()`, `updateUserRight()`. Exports `MODULES` and `RIGHTS` arrays.
- `pagination.js` — `PAGE_SIZE`, `clampPage(page, totalPages)`, `getPageItems(items, page)`.
- `rights.js` — `RIGHT_NAMES` array (canonical source of truth for all 9 right names).

### Database Migrations (`db/migrations/`)

Run in Supabase SQL editor in order:
1. `initial_schema.sql`
2. `rights_seed.sql` — creates user/user_module/user_rights tables, seeds SUPERADMIN, backfills existing auth users
3. `04_provision_user_trigger.sql` — auto-provisions new registrations as USER/INACTIVE
4. `05_customer_status_columns.sql`, `06_api_role_grants.sql`
5. `rls/customer_rls.sql`, `rls/admin_module_rls.sql`, `rls/view_only_rls.sql`
6. `views/customer_sales_summary.sql`, `views/product_current_price.sql`, `views/product_revenue.sql`

After seeding, any existing ADMIN users need `CUST_DEL` corrected:
```sql
UPDATE user_rights SET right_value = 0
WHERE right_name = 'CUST_DEL'
  AND "userId" IN (SELECT "userId" FROM "user" WHERE user_type = 'ADMIN');
```

### Hard Rules (from spec — never violate)

- **No hard deletes.** The SQL `DELETE` keyword must never appear in application code, Supabase functions, or RLS policies. Customer removal = set `record_status = 'INACTIVE'`.
- **INACTIVE customers are invisible to USER accounts** — enforced in both `getCustomers()` (client filter) and RLS policy.
- **sales, salesdetail, product, priceHist are view-only** for all user types. No add/edit/delete operations through the app.
- **SUPERADMIN rows cannot be modified** via AdminPage — enforced at UI (`isSuperAdmin` disables all controls) and RLS (`user_type != 'SUPERADMIN'` policy).

### Branching Workflow

- Work branches cut from `dev`, named by convention: `feat/...`, `db/...`, `test/...`
- PRs into `dev`; release PR from `dev` → `main`
- Never push directly to `main` or `dev`

### Testing

Tests live in `src/test/`. They use Vitest + React Testing Library. Supabase and context hooks are mocked with `vi.mock()`. Tests are organized by sprint deliverable.
