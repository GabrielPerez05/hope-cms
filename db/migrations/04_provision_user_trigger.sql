-- 1. Create the function for auto-provisioning
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create the profile in public.user.
    INSERT INTO public."user" ("userId", email, username, user_type, record_status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        CASE WHEN lower(NEW.email) = 'jcesperanza@neu.edu.ph' THEN 'SUPERADMIN' ELSE 'USER' END,
        CASE WHEN lower(NEW.email) = 'jcesperanza@neu.edu.ph' THEN 'ACTIVE' ELSE 'INACTIVE' END
    )
    ON CONFLICT ("userId") DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        user_type = EXCLUDED.user_type,
        record_status = EXCLUDED.record_status;

    -- Insert 4 Module Rows (Cust, Sales, Prod active; Admin inactive)
    INSERT INTO public.user_module ("userId", module_name, is_active)
    VALUES 
        (NEW.id, 'Customers', true),
        (NEW.id, 'Sales', true),
        (NEW.id, 'Products', true),
        (NEW.id, 'Admin', lower(NEW.email) = 'jcesperanza@neu.edu.ph')
    ON CONFLICT ("userId", module_name) DO UPDATE SET
        is_active = EXCLUDED.is_active;

    -- Insert 9 Rights Rows (View rights = 1, Action rights = 0)
    INSERT INTO public.user_rights ("userId", right_name, right_value)
    VALUES 
        (NEW.id, 'CUST_VIEW', 1),
        (NEW.id, 'CUST_ADD', CASE WHEN lower(NEW.email) = 'jcesperanza@neu.edu.ph' THEN 1 ELSE 0 END),
        (NEW.id, 'CUST_EDIT', CASE WHEN lower(NEW.email) = 'jcesperanza@neu.edu.ph' THEN 1 ELSE 0 END),
        (NEW.id, 'CUST_DEL', CASE WHEN lower(NEW.email) = 'jcesperanza@neu.edu.ph' THEN 1 ELSE 0 END),
        (NEW.id, 'SALES_VIEW', 1),
        (NEW.id, 'SD_VIEW', 1),
        (NEW.id, 'PROD_VIEW', 1),
        (NEW.id, 'PRICE_VIEW', 1),
        (NEW.id, 'ADM_USER', CASE WHEN lower(NEW.email) = 'jcesperanza@neu.edu.ph' THEN 1 ELSE 0 END)
    ON CONFLICT ("userId", right_name) DO UPDATE SET
        right_value = EXCLUDED.right_value;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger to fire on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();
