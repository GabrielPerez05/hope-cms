# Final RLS Audit - Sprint Cleanup

Validated on 2026-05-14 as part of Sprint 1 cleanup before Sprint 2.

## Customer Table

- `customer` RLS is enabled.
- Authenticated users can select active customer rows.
- active `ADMIN` and `SUPERADMIN` users can select all customer rows.
- Customer insert/update/deactivate policies use `public.user_rights`.
- Policies use Supabase `auth.uid()` instead of database `current_user`.

## Sales / SalesDetail / Product / PriceHist

- SELECT-only policies are defined for authenticated users.

## User, User Module, And User Rights

- `public."user"`, `public.user_module`, and `public.user_rights` RLS are enabled.
- Users can select their own profile, module rows, and rights rows.
- active admin users can view and modify non-SUPERADMIN users/modules/rights.
- SUPERADMIN user rows and rights are protected from admin modification.
- Admin checks use security-definer helper functions to avoid self-referential RLS recursion.

## Remaining Notes

- Execute `db/migrations/rls/customer_rls.sql` and `db/migrations/rls/admin_module_rls.sql` in Supabase before relying on RLS in Sprint 2.
- Re-run `db/migrations/verify_seed.sql` after applying RLS to confirm seed and auth data remain valid.
