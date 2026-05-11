-- 1. Create the function for auto-provisioning
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create the profile in public.user (Status: INACTIVE)
    INSERT INTO public.user (userId, username, user_type, record_status)
    VALUES (NEW.id, NEW.email, 'USER', 'INACTIVE');

    -- Insert 4 Module Rows (Cust, Sales, Prod active; Admin inactive)
    INSERT INTO public.user_module (userId, module_name, is_active)
    VALUES 
        (NEW.id, 'Customers', true),
        (NEW.id, 'Sales', true),
        (NEW.id, 'Products', true),
        (NEW.id, 'Admin', false);

    -- Insert 9 Rights Rows (View rights = 1, Action rights = 0)
    INSERT INTO public.user_rights (userId, right_name, right_value)
    VALUES 
        (NEW.id, 'CUST_VIEW', 1), (NEW.id, 'CUST_ADD', 0), (NEW.id, 'CUST_EDIT', 0),
        (NEW.id, 'SALES_VIEW', 1), (NEW.id, 'PRICE_VIEW', 1), (NEW.id, 'PROD_VIEW', 1),
        (NEW.id, 'SD_VIEW', 1), (NEW.id, 'REC_DEL', 0), (NEW.id, 'SYS_ADMIN', 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger to fire on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();