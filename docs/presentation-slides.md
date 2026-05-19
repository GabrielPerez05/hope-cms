# Hope CMS — Sprint 3 Presentation Deck

**Hope, Inc. | Customer Management System**
New Era University — BS Information Technology
12-Slide Deck | Sprint 3 Final

---

## Slide 1 — Title

**Hope CMS**
Customer & Sales Management System

> Sprint 3 Final Presentation
> Hope, Inc. | New Era University BS Information Technology

Team Members:
- M1 — Project Lead / Full-Stack Developer
- M2 — Database & Backend Engineer
- M3 — Security & RLS Specialist
- M4 — Rights & Authentication Specialist
- M5 — QA / Documentation Specialist

[Screenshot: Live app login page as backdrop]

---

## Slide 2 — System Overview

**What is Hope CMS?**

A web-based Customer and Sales Management System built for Hope, Inc. It provides:

- Secure multi-user access with role-based permissions
- Full customer lifecycle management (add, edit, soft-delete, recover, revert)
- Sales transaction history with drill-down to line items
- Product catalogue and revenue reporting
- Admin module for user management and rights control

[Screenshot: App dashboard — customers list view logged in as SUPERADMIN]

---

## Slide 3 — Tech Stack and Architecture

**Stack**

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| Auth | Supabase Auth — Email/Password + Google OAuth |

**Architecture**

- SPA with client-side routing (vercel.json rewrites for production)
- Context-based state: AuthContext (session) + UserRightsContext (RBAC)
- API layer in src/lib/ — all DB calls go through typed functions
- Row Level Security enforced server-side — UI gates are a UX layer, not the security layer

---

## Slide 4 — Database Table Relationships

**Core Tables**

```
auth.users (Supabase Auth)
    └── user            (userId, username, user_type, record_status)
            └── user_module  (module access flags)
            └── user_rights  (9 granular right values per user)

customer        (custno, custname, address, payterm, record_status, stamp, prev_snapshot)
    └── sales       (salesno, custno, salesdate, amount)
            └── salesdetail (salesno, prodcode, qty, unitprice)

product         (prodcode, description, unit)
    └── pricehist   (prodcode, effdate, unitprice)
```

[Screenshot: Supabase Table Editor showing customer and user tables]

Key design rule: No hard deletes anywhere — soft-delete only (record_status = INACTIVE).

---

## Slide 5 — Rights Matrix

**3 User Types x 9 Rights**

| Right | USER | ADMIN | SUPERADMIN |
|-------|:----:|:-----:|:----------:|
| CUST_VIEW | Yes | Yes | Yes |
| CUST_ADD | No | Yes | Yes |
| CUST_EDIT | No | Yes | Yes |
| CUST_DEL | No | No | Yes |
| SALES_VIEW | Yes | Yes | Yes |
| SD_VIEW | Yes | Yes | Yes |
| PROD_VIEW | Yes | Yes | Yes |
| PRICE_VIEW | Yes | Yes* | Yes |
| ADM_USER | No | Yes | Yes |

> *PRICE_VIEW can be individually revoked for ADMIN accounts.
> CUST_DEL is set to 0 for ADMIN by design — only SUPERADMIN can soft-delete.

All rights stored in user_rights table and enforced at both UI and RLS level.

---

## Slide 6 — CRUD Demo: Customer Management

**Customer Lifecycle**

1. **Add** — CUST_ADD gated; saves CREATED audit stamp with actor name and role
2. **View** — Paginated list with search by name or customer number
3. **Edit** — CUST_EDIT gated; saves UPDATED stamp with changed fields and actor
4. **Soft Delete** — SUPERADMIN only; requires a reason; sets record_status = INACTIVE
5. **Recover** — ADMIN/SUPERADMIN; restores record_status = ACTIVE
6. **Revert** — SUPERADMIN only; one-level undo of last edit via prev_snapshot JSONB column

[Screenshot: Customers page showing stamp column with actor info]

[Screenshot: Delete confirmation dialog with reason textarea]

---

## Slide 7 — Sales Drill-Down Demo

**Sales to Line Items to Product + Price**

Navigation flow:
1. Open **Sales** page — shows all transactions (order no, customer, date, total)
2. Click an order number — Sales Detail expands showing each line item
3. Each line item: product code, description, quantity, unit price, line total

[Screenshot: Sales page with a transaction row expanded showing line items]

[Screenshot: Customer Detail page showing that customer full sales history]

> All sales data is view-only for every user type — no mutations possible through UI or API.

---

## Slide 8 — Reports

**Three Revenue Reports (PRICE_VIEW gated)**

| Report | Data Source | Key Feature |
|--------|------------|-------------|
| Customer Sales Summary | customer_sales_summary view | Sortable columns, total spend per customer |
| Top Customers | Same view, top 10 by totalSpend | Ranked leaderboard |
| Product Revenue | product_revenue view | Revenue per product across all sales |

[Screenshot: Customer Sales Summary report with sorted column]

[Screenshot: Top Customers report showing rank and total spend]

[Screenshot: Product Revenue report]

> Reports hidden from sidebar for ADMIN users whose PRICE_VIEW right is disabled.

---

## Slide 9 — Admin Module

**User Management for ADMIN and SUPERADMIN**

[Screenshot: Admin page showing user list with status badges]

**What ADMIN can do:**
- Activate / Deactivate USER accounts only
- Cannot touch ADMIN or SUPERADMIN rows

**What SUPERADMIN can do:**
- Promote USER to ADMIN or demote ADMIN to USER (rights auto-reset via set_role_rights RPC)
- Customize individual rights per user via checkboxes
- SUPERADMIN rows fully locked in UI (all controls disabled, tooltip shown)

[Screenshot: SUPERADMIN row with all buttons greyed out and tooltip]

DB-level enforcement: RLS policies reject unauthorized updates server-side even if UI is bypassed.

---

## Slide 10 — Sprint 3 Security Highlights

**Key Deliverables This Sprint**

**RBAC Hardening (M4)**
- Admin Module sidebar gated to ADM_USER right
- SUPERADMIN rows locked in UI and RLS policy
- ADMIN peer restriction: ADMIN cannot modify fellow ADMIN accounts
- PRICE_VIEW correctly hides all 3 report pages for ADMIN

**Audit Stamps with Actor Identity**
- Every customer mutation records: ACTION:timestamp|note|by:username(ROLE)
- 60-character VARCHAR budget with smart truncation
- SUPERADMIN can revert last edit via prev_snapshot JSONB column

**Auth Callback Fix**
- New registrations: "Account created — pending activation"
- Returning inactive users: "Account not yet activated — contact your admin"
- Differentiated by session.user.created_at age (under 2 minutes = new account)

[Screenshot: Auth callback page showing the correct message for a returning inactive user]

---

## Slide 11 — Lessons Learned

**Technical**

- **RLS WITH CHECK vs USING**: USING filters which rows are visible or updatable; WITH CHECK validates what the new row state can be — both are needed for full protection.
- **SECURITY DEFINER functions**: The only way to bypass RLS for trusted server-side operations such as set_role_rights updating rows the caller cannot directly touch.
- **VARCHAR budget awareness**: A 60-char stamp column forces deliberate prioritization — action and timestamp first, actor info always preserved, note gets remaining space.
- **Soft-delete discipline**: Never using SQL DELETE in application code meant every removed record remained recoverable.

**Process**

- Branch-per-feature with PRs into dev kept main always stable.
- DB migrations as .sql files in the repo gave the team a shared, reviewable history of every schema change.
- Testing all 3 user types manually at each sprint caught permission gaps that unit tests missed.

---

## Slide 12 — Q&A

**Hope CMS — Sprint 3 Complete**

[Screenshot: Live app — Customers page logged in as SUPERADMIN showing full feature set]

**What was built across 3 sprints:**
- Full auth flow (email + Google OAuth, login guard for inactive users)
- Customer CRUD with soft-delete, recovery, revert, and audit stamps
- Sales drill-down, product catalogue, and 3 revenue reports
- Role-based access control: 3 user types, 9 rights, enforced at UI and DB
- Admin module: user activation, role promotion, rights customization
- Production deployment on Vercel with Supabase cloud backend

**Thank you.**

---

*Hope CMS — Sprint 3 Final | Hope, Inc. | New Era University BS Information Technology*
