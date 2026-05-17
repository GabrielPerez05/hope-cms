-- Sprint 1 app auth/profile/rights tables used by the React app.
CREATE TABLE IF NOT EXISTS public."user" (
    "userId" UUID PRIMARY KEY REFERENCES auth.users(id),
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
    "userId" UUID NOT NULL REFERENCES public."user"("userId"),
    module_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE ("userId", module_name)
);

CREATE TABLE IF NOT EXISTS public.user_rights (
    "userId" UUID NOT NULL REFERENCES public."user"("userId"),
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

-- Backfill app profiles for Auth users that already existed before the trigger
-- or before this schema was installed.
INSERT INTO public."user" ("userId", email, username, user_type, record_status)
SELECT
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'username',
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        au.email
    ),
    CASE
        WHEN lower(au.email) = 'jcesperanza@neu.edu.ph' THEN 'SUPERADMIN'
        WHEN lower(au.email) = 'rhiyanjoshua.ticbobolan@neu.edu.ph' THEN 'ADMIN'
        ELSE 'USER'
    END,
    CASE
        WHEN lower(au.email) IN (
            'jcesperanza@neu.edu.ph',
            'rhiyanjoshua.ticbobolan@neu.edu.ph'
        ) THEN 'ACTIVE'
        ELSE 'INACTIVE'
    END
FROM auth.users au
ON CONFLICT ("userId") DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username;

INSERT INTO public.user_module ("userId", module_name, is_active)
SELECT
    u."userId",
    modules.module_name,
    CASE
        WHEN u.user_type IN ('ADMIN', 'SUPERADMIN') THEN true
        ELSE modules.module_name IN ('Customers', 'Sales', 'Products')
    END
FROM public."user" u
CROSS JOIN (VALUES ('Customers'), ('Sales'), ('Products'), ('Admin')) AS modules(module_name)
ON CONFLICT ("userId", module_name) DO NOTHING;

INSERT INTO public.user_rights ("userId", right_name, right_value)
SELECT
    u."userId",
    rights.right_name,
    CASE
        WHEN u.user_type = 'SUPERADMIN' THEN 1
        WHEN u.user_type = 'ADMIN' THEN
            CASE
                WHEN rights.right_name IN (
                    'CUST_VIEW',
                    'CUST_ADD',
                    'CUST_EDIT',
                    'CUST_DEL',
                    'SALES_VIEW',
                    'SD_VIEW',
                    'PROD_VIEW',
                    'PRICE_VIEW',
                    'ADM_USER'
                ) THEN 1
                ELSE 0
            END
        WHEN rights.right_name IN ('CUST_VIEW', 'SALES_VIEW', 'SD_VIEW', 'PROD_VIEW', 'PRICE_VIEW') THEN 1
        ELSE 0
    END
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
ON CONFLICT ("userId", right_name) DO NOTHING;
