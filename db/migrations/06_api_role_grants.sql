-- Required for Supabase client access. RLS policies still decide which rows
-- each signed-in user can read or modify.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE public.customer TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.customer TO authenticated;

GRANT SELECT ON TABLE public.sales TO authenticated;
GRANT SELECT ON TABLE public.salesDetail TO authenticated;
GRANT SELECT ON TABLE public.product TO authenticated;
GRANT SELECT ON TABLE public.priceHist TO authenticated;

GRANT SELECT ON TABLE public."user" TO authenticated;
GRANT SELECT ON TABLE public.user_module TO authenticated;
GRANT SELECT ON TABLE public.user_rights TO authenticated;
GRANT UPDATE ON TABLE public."user" TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.user_module TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.user_rights TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
