-- Sprint 1 verification query.
-- Returns one CSV-friendly result set for Supabase SQL Editor.

SELECT 'customer_count' AS check_name, COUNT(*)::TEXT AS result FROM public.customer
UNION ALL
SELECT 'sales_count', COUNT(*)::TEXT FROM public.sales
UNION ALL
SELECT 'salesdetail_count', COUNT(*)::TEXT FROM public.salesDetail
UNION ALL
SELECT 'product_count', COUNT(*)::TEXT FROM public.product
UNION ALL
SELECT 'pricehist_count', COUNT(*)::TEXT FROM public.priceHist
UNION ALL
SELECT 'invalid_payments', COUNT(*)::TEXT
FROM public.payment p
WHERE NOT EXISTS (
  SELECT 1 FROM public.sales s WHERE s.transNo = p.transNo
)
UNION ALL
SELECT 'invalid_salesdetail', COUNT(*)::TEXT
FROM public.salesDetail sd
WHERE NOT EXISTS (
  SELECT 1 FROM public.sales s WHERE s.transNo = sd.transNo
)
OR NOT EXISTS (
  SELECT 1 FROM public.product pr WHERE pr.prodCode = sd.prodCode
)
UNION ALL
SELECT 'invalid_pricehist', COUNT(*)::TEXT
FROM public.priceHist ph
WHERE NOT EXISTS (
  SELECT 1 FROM public.product pr WHERE pr.prodCode = ph.prodCode
)
UNION ALL
SELECT 'superadmin_enabled_rights', COUNT(*)::TEXT
FROM public."user" u
JOIN public.user_rights ur ON ur."userId" = u."userId"
WHERE lower(u.email) = 'jcesperanza@neu.edu.ph'
  AND ur.right_value = 1
UNION ALL
SELECT 'provision_new_user_function_exists', COUNT(*)::TEXT
FROM pg_proc
WHERE proname = 'provision_new_user'
UNION ALL
SELECT 'on_auth_user_created_trigger_exists', COUNT(*)::TEXT
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_table = 'users'
UNION ALL
SELECT 'non_superadmin_user_count', COUNT(*)::TEXT
FROM public."user"
WHERE lower(email) != 'jcesperanza@neu.edu.ph'
UNION ALL
SELECT 'non_superadmin_users_with_9_rights', COUNT(*)::TEXT
FROM (
  SELECT u."userId"
  FROM public."user" u
  JOIN public.user_rights ur ON ur."userId" = u."userId"
  WHERE lower(u.email) != 'jcesperanza@neu.edu.ph'
  GROUP BY u."userId"
  HAVING COUNT(*) = 9
) provisioned_users
UNION ALL
SELECT 'inactive_non_superadmin_user_count', COUNT(*)::TEXT
FROM public."user"
WHERE lower(email) != 'jcesperanza@neu.edu.ph'
  AND user_type = 'USER'
  AND record_status = 'INACTIVE';
