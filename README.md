# Hope CMS

A web-based Customer Management System built with React and Supabase. Hope CMS allows businesses to manage customers, track sales transactions, browse product catalogues, generate reports, and control user access through a role-based permission system.

## Live Demo

**Production:** [https://hope-cms-rouge.vercel.app](https://hope-cms-rouge.vercel.app)

---

## Features

- **Authentication** — Email/password login and Google OAuth (PKCE flow) with email verification support
- **Login Guard** — INACTIVE accounts are automatically blocked from signing in
- **Customer Management** — Add, edit, and soft-delete customers; recover deleted customers
- **Sales Tracking** — Browse all transactions and drill down to line items per transaction
- **Product Catalogue** — View all products with current pricing and full price history
- **Reports** — Customer Sales Summary, Top Customers, and Product Revenue dashboards
- **Admin Panel** — Manage user accounts, roles, and individual permission flags
- **Role-Based Access Control** — Three user types with 9 granular rights
- **SUPERADMIN Protection** — SUPERADMIN rows are fully locked from modification at both UI and database (RLS) level
- **Soft-Delete Only** — No hard deletes anywhere in the system; all removals set record_status = INACTIVE
- **Row Level Security** — All Supabase tables are protected by RLS policies enforced at the database level

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Testing | Vitest + React Testing Library |

---

## User Roles

| Role | Description |
|---|---|
| USER | Standard read-only access; sees only ACTIVE customers |
| ADMIN | Can manage customers, activate/deactivate users, and recover deleted customers |
| SUPERADMIN | Full access including soft-delete, rights management, and role assignment |

### Granular Rights (9 total)

| Right | Description |
|---|---|
| CUST_VIEW | View customer list |
| CUST_ADD | Add new customers |
| CUST_EDIT | Edit existing customers |
| CUST_DEL | Soft-delete customers (SUPERADMIN only) |
| SALES_VIEW | View sales transactions |
| SD_VIEW | View sales detail / line items |
| PROD_VIEW | View product catalogue |
| PRICE_VIEW | View price history |
| ADM_USER | Access the Admin panel |

---

## Pages

| Route | Page | Access |
|---|---|---|
| /login | Login | Public |
| /register | Register | Public |
| /auth/callback | OAuth Callback | Public |
| /customers | Customer List | Authenticated |
| /customers/:custNo | Customer Detail + Sales History | Authenticated |
| /sales | Sales Transactions | Authenticated |
| /products | Product Catalogue + Price History | Authenticated |
| /admin | User Management | ADMIN / SUPERADMIN / ADM_USER right |
| /deleted-customers | Soft-Deleted Customers | ADMIN / SUPERADMIN only |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

```bash
git clone https://github.com/GabrielPerez05/hope-cms.git
cd hope-cms
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Running the App

```bash
npm run dev
```

---

## Database Setup

Run the following migration files in order in the Supabase SQL Editor:

1. `db/migrations/initial_schema.sql`
2. `db/migrations/rights_seed.sql`
3. `db/migrations/04_provision_user_trigger.sql`
4. `db/migrations/05_customer_status_columns.sql`
5. `db/migrations/06_api_role_grants.sql`
6. `db/migrations/rls/customer_rls.sql`
7. `db/migrations/rls/admin_module_rls.sql`
8. `db/migrations/rls/view_only_rls.sql`
9. `db/migrations/views/customer_sales_summary.sql`
10. `db/migrations/views/product_current_price.sql`
11. `db/migrations/views/product_revenue.sql`

---

## Testing

```bash
npm run test
npx vitest run src/test/<file>.test.jsx
```

### Test Coverage

| File | Description |
|---|---|
| sprint1-auth-flows.test.jsx | Auth flows: Google OAuth, email signup, session persistence, inactive guard, route protection |
| rights-customer-gating.test.jsx | Customer page rights gating for CUST_ADD, CUST_EDIT, CUST_DEL |
| rights-sidebar-nav.test.jsx | Sidebar navigation visibility based on rights and user type |
| sprint2-rights-27-cases.test.jsx | 3 user types x 9 rights = 27-case customer controls matrix |
| sprint2-viewonly-softdelete.test.jsx | View-only enforcement and soft-delete recovery flows |
| e2e-rights-production.test.jsx | Sprint 3 regression: ADM_USER gating, SUPERADMIN protection, OAuth, view-only |
| sprint3-e2e-production.test.jsx | Full E2E: all user types across all pages and SUPERADMIN protection |

---

## Project Structure

```
src/
├── components/    Shared UI components (AppShell, Pagination, Toast, etc.)
├── contexts/      AuthContext, UserRightsContext
├── hooks/         useAuth, useRights, useHeartbeat
├── lib/           API layer (customer-api, sales-product-api, admin-api, supabase)
├── pages/         Page components (CustomersPage, SalesPage, AdminPage, etc.)
└── test/          Vitest test suites
db/
└── migrations/    SQL migration files and RLS policies
```

---

## Team

| Member | Role |
|---|---|
| Gabriel Red Ray Perez | M1 — UI / Frontend |
| Timothy John Gandeza | M2 — Backend / API |
| Lars Ulrich Galamiton | M3 — Database / RLS |
| Rhyian Joshua Ticbobolan | M4 — Rights and Authentication |
| Clark Kent Zuñiga | M5 — QA / Documentation |

---

## License

This project was developed as a capstone system for academic purposes.
