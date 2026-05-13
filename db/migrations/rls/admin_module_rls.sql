-- Enable RLS on user and UserModule_Rights
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE UserModule_Rights ENABLE ROW LEVEL SECURITY;

-- ADMIN can update record_status only if user_type != SUPERADMIN
CREATE POLICY admin_update_user_status
ON "user"
FOR UPDATE
TO admin
USING (user_type != 'SUPERADMIN')
WITH CHECK (user_type != 'SUPERADMIN');

-- ADMIN cannot update user_type or any column on SUPERADMIN rows
CREATE POLICY admin_no_update_superadmin
ON "user"
FOR UPDATE
TO admin
USING (user_type != 'SUPERADMIN');

-- ADMIN cannot insert/update/delete UserModule_Rights rows for SUPERADMIN
CREATE POLICY admin_no_modify_superadmin_rights
ON UserModule_Rights
FOR ALL
TO admin
USING (NOT EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.userid = UserModule_Rights.userid
      AND u.user_type = 'SUPERADMIN'
));
