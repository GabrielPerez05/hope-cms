ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_select_active_or_admin ON public.customer;
DROP POLICY IF EXISTS customer_insert_with_add_right ON public.customer;
DROP POLICY IF EXISTS customer_update_with_edit_right ON public.customer;
DROP POLICY IF EXISTS customer_deactivate_with_delete_right ON public.customer;
DROP POLICY IF EXISTS customer_recover_admin_only ON public.customer;
DROP POLICY IF EXISTS user_select_active ON public.customer;
DROP POLICY IF EXISTS admin_super_select_all ON public.customer;
DROP POLICY IF EXISTS user_insert_customer ON public.customer;
DROP POLICY IF EXISTS user_update_customer ON public.customer;
DROP POLICY IF EXISTS user_deactivate_customer ON public.customer;
DROP POLICY IF EXISTS admin_recover_customer ON public.customer;

CREATE POLICY customer_select_active_or_admin
ON public.customer
FOR SELECT
TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u."userId" = auth.uid()
      AND u.user_type IN ('ADMIN', 'SUPERADMIN')
      AND u.record_status = 'ACTIVE'
  )
);

CREATE POLICY customer_insert_with_add_right
ON public.customer
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_rights ur
    JOIN public."user" u ON u."userId" = ur."userId"
    WHERE ur."userId" = auth.uid()
      AND ur.right_name = 'CUST_ADD'
      AND ur.right_value = 1
      AND u.record_status = 'ACTIVE'
  )
);

CREATE POLICY customer_update_with_edit_right
ON public.customer
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_rights ur
    JOIN public."user" u ON u."userId" = ur."userId"
    WHERE ur."userId" = auth.uid()
      AND ur.right_name = 'CUST_EDIT'
      AND ur.right_value = 1
      AND u.record_status = 'ACTIVE'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_rights ur
    JOIN public."user" u ON u."userId" = ur."userId"
    WHERE ur."userId" = auth.uid()
      AND ur.right_name = 'CUST_EDIT'
      AND ur.right_value = 1
      AND u.record_status = 'ACTIVE'
  )
);

CREATE POLICY customer_deactivate_with_delete_right
ON public.customer
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_rights ur
    JOIN public."user" u ON u."userId" = ur."userId"
    WHERE ur."userId" = auth.uid()
      AND ur.right_name = 'CUST_DEL'
      AND ur.right_value = 1
      AND u.record_status = 'ACTIVE'
  )
)
WITH CHECK (record_status = 'INACTIVE');

CREATE POLICY customer_recover_admin_only
ON public.customer
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."user" u
    WHERE u."userId" = auth.uid()
      AND u.user_type IN ('ADMIN', 'SUPERADMIN')
      AND u.record_status = 'ACTIVE'
  )
)
WITH CHECK (record_status = 'ACTIVE');
