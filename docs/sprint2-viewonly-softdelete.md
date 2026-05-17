# Sprint 2 View-Only And Soft-Delete Validation

Validated locally on 2026-05-17 before Sprint 3 planning.

## Automated Verification

Commands run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Result: pass.

## View-Only Enforcement Gate

Explicit Sprint 2 gate: Sales, Sales Detail, Product, and Price History views must render zero add/edit/delete mutation buttons for all three user types.

| User Type | Sales | Sales Detail | Product | Price History | Result |
| --- | --- | --- | --- | --- | --- |
| USER | No mutation buttons | No mutation buttons | No mutation buttons | No mutation buttons | Pass |
| ADMIN | No mutation buttons | No mutation buttons | No mutation buttons | No mutation buttons | Pass |
| SUPERADMIN | No mutation buttons | No mutation buttons | No mutation buttons | No mutation buttons | Pass |

Sign-off: view-only enforcement is explicitly verified by `src/test/sprint2-viewonly-softdelete.test.jsx`.

## Soft Delete And Recovery

Automated checks:

- `SUPERADMIN + CUST_DEL` can see Delete on active customers.
- `ADMIN + CUST_DEL` cannot see Delete on active customers.
- Deleted Customers page supports ADMIN recovery of a soft-deleted customer.

Live Supabase checks to perform before Sprint 3:

- Soft-delete `C0001` as SUPERADMIN and confirm it disappears from a USER customer list.
- Confirm ADMIN can see `C0001` in Deleted Customers.
- Recover `C0001` as ADMIN and confirm it returns to active customer lists.

## API/RLS Notes

Local UI tests verify that mutation controls are absent when rights do not allow them. Supabase RLS should still be verified in the SQL editor for direct API bypass attempts:

- USER update/delete against `customer` is blocked without the matching right.
- Inactive users are blocked by auth guard and RLS policies.
- Sales, sales detail, product, and price history tables expose read-only access only.
