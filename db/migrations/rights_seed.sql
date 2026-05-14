-- Sprint 1 app auth/profile/rights tables used by the React app.
CREATE TABLE IF NOT EXISTS public."user" (
    "userId" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    username TEXT,
    user_type TEXT NOT NULL DEFAULT 'USER'
        CHECK (user_type IN ('USER', 'ADMIN', 'SUPERADMIN')),
    record_status TEXT NOT NULL DEFAULT 'INACTIVE'
        CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_module (
    id BIGSERIAL PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES public."user"("userId") ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE ("userId", module_name)
);

CREATE TABLE IF NOT EXISTS public.user_rights (
    "userId" UUID NOT NULL REFERENCES public."user"("userId") ON DELETE CASCADE,
    right_name TEXT NOT NULL,
    right_value INTEGER NOT NULL DEFAULT 0 CHECK (right_value IN (0, 1)),
    PRIMARY KEY ("userId", right_name)
);

-- If the SUPERADMIN auth user already exists, seed their profile, modules, and all 9 rights.
INSERT INTO public."user" ("userId", email, username, user_type, record_status)
SELECT id, email, COALESCE(raw_user_meta_data->>'username', email), 'SUPERADMIN', 'ACTIVE'
FROM auth.users
WHERE lower(email) = 'jcesperanza@neu.edu.ph'
ON CONFLICT ("userId") DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    user_type = 'SUPERADMIN',
    record_status = 'ACTIVE';

INSERT INTO public.user_module ("userId", module_name, is_active)
SELECT u."userId", module_name, true
FROM public."user" u
CROSS JOIN (VALUES ('Customers'), ('Sales'), ('Products'), ('Admin')) AS modules(module_name)
WHERE lower(u.email) = 'jcesperanza@neu.edu.ph'
ON CONFLICT ("userId", module_name) DO UPDATE SET
    is_active = EXCLUDED.is_active;

INSERT INTO public.user_rights ("userId", right_name, right_value)
SELECT u."userId", right_name, 1
FROM public."user" u
CROSS JOIN (
    VALUES
        ('CUST_VIEW'),
        ('CUST_ADD'),
        ('CUST_EDIT'),
        ('CUST_DEL'),
        ('SALES_VIEW'),
        ('SD_VIEW'),
        ('PROD_VIEW'),
        ('PRICE_VIEW'),
        ('ADM_USER')
) AS rights(right_name)
WHERE lower(u.email) = 'jcesperanza@neu.edu.ph'
ON CONFLICT ("userId", right_name) DO UPDATE SET
    right_value = EXCLUDED.right_value;