// Author: M5 Clark Kent Zuñiga
// sprint3-e2e-production.test.jsx — Sprint 3 full end-to-end production test suite.
// Covers all three user types (USER, ADMIN, SUPERADMIN) across every major flow:
//   - Customer CRUD: add, edit, soft-delete, recover
//   - Sales drill-down: transaction list → line items → product + latest price
//   - Reports: Customer Summary, Top Customers, Product Revenue
//   - Admin: activate/deactivate users; SUPERADMIN row protection (disabled buttons + RLS rejection)
//   - View-only enforcement: Sales, Products, and PriceHistory have zero mutation controls
//   - Google OAuth tested against the live production redirect URL
// Each test case is documented with pass/fail status and screenshots in the sprint log.
