CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."user"
    WHERE "userId" = auth.uid()
      AND user_type IN ('ADMIN', 'SUPERADMIN')
      AND record_status = 'ACTIVE'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."user"
    WHERE "userId" = target_user_id
      AND user_type = 'SUPERADMIN'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superadmin_user(UUID) TO authenticated;

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_select_self_or_admin ON public."user";
DROP POLICY IF EXISTS admin_update_non_superadmin_users ON public."user";
DROP POLICY IF EXISTS user_module_select_self_or_admin ON public.user_module;
DROP POLICY IF EXISTS admin_modify_non_superadmin_modules ON public.user_module;
DROP POLICY IF EXISTS user_rights_select_self_or_admin ON public.user_rights;
DROP POLICY IF EXISTS admin_modify_non_superadmin_rights ON public.user_rights;
DROP POLICY IF EXISTS admin_update_user_status ON public."user";
DROP POLICY IF EXISTS admin_no_update_superadmin ON public."user";
DROP POLICY IF EXISTS admin_no_modify_superadmin_rights ON public.user_rights;

CREATE POLICY user_select_self_or_admin
ON public."user"
FOR SELECT
TO authenticated
USING ("userId" = auth.uid() OR public.is_active_admin());

CREATE POLICY admin_update_non_superadmin_users
ON public."user"
FOR UPDATE
TO authenticated
USING (
  public.is_active_admin()
  AND user_type != 'SUPERADMIN'
)
WITH CHECK (user_type != 'SUPERADMIN');

CREATE POLICY user_module_select_self_or_admin
ON public.user_module
FOR SELECT
TO authenticated
USING ("userId" = auth.uid() OR public.is_active_admin());

CREATE POLICY admin_modify_non_superadmin_modules
ON public.user_module
FOR ALL
TO authenticated
USING (
  public.is_active_admin()
  AND NOT public.is_superadmin_user("userId")
)
WITH CHECK (
  public.is_active_admin()
  AND NOT public.is_superadmin_user("userId")
);

CREATE POLICY user_rights_select_self_or_admin
ON public.user_rights
FOR SELECT
TO authenticated
USING ("userId" = auth.uid() OR public.is_active_admin());

CREATE POLICY admin_modify_non_superadmin_rights
ON public.user_rights
FOR ALL
TO authenticated
USING (
  public.is_active_admin()
  AND NOT public.is_superadmin_user("userId")
)
WITH CHECK (
  public.is_active_admin()
  AND NOT public.is_superadmin_user("userId")
);
