-- Migration 07 accidentally removed SUPERADMIN's ability to promote/demote users
-- by replacing the shared policy with one only matching ADMIN role.
-- Split into two targeted policies.

DROP POLICY IF EXISTS admin_update_non_superadmin_users ON "user";

-- SUPERADMIN can update any non-SUPERADMIN user (promote, demote, activate, deactivate)
CREATE POLICY superadmin_update_any_user
ON "user" FOR UPDATE
TO authenticated
USING (
  (SELECT user_type FROM "user" WHERE "userId" = auth.uid()) = 'SUPERADMIN'
  AND user_type != 'SUPERADMIN'
)
WITH CHECK (user_type != 'SUPERADMIN');

-- ADMIN can only activate/deactivate USER accounts (not change role, not touch ADMINs)
CREATE POLICY admin_update_user_accounts_only
ON "user" FOR UPDATE
TO authenticated
USING (
  (SELECT user_type FROM "user" WHERE "userId" = auth.uid()) = 'ADMIN'
  AND user_type = 'USER'
)
WITH CHECK (user_type = 'USER');
