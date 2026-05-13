# Final RLS Audit — Sprint 3

## Customer Table
- 5 policies confirmed (select_active, admin_super_select_all, insert, update, deactivate/recover).

## Sales / SalesDetail / Product / PriceHist
- SELECT-only policies confirmed.

## User + UserModule_Rights
- SUPERADMIN guard confirmed:
  - ADMIN cannot update SUPERADMIN rows.
  - ADMIN cannot modify SUPERADMIN rights.

## Hard Delete Audit
- grep confirms no DELETE statements in Supabase functions, triggers, or migration files.

## Database Backup
- Backup verified in Supabase Dashboard.
