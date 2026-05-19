-- Tighten ADMIN update policy: ADMIN may only activate/deactivate USER accounts,
-- not peer ADMIN accounts (per spec section 3.1).
DROP POLICY IF EXISTS admin_update_non_superadmin_users ON "user";

CREATE POLICY admin_update_non_superadmin_users
  ON "user" FOR UPDATE
  TO authenticated
  USING (
    (SELECT user_type FROM "user" WHERE "userId" = auth.uid()) = 'ADMIN'
    AND user_type = 'USER'
  );
