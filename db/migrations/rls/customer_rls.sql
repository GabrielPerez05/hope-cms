ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

-- USER role: can only see ACTIVE customers
CREATE POLICY user_select_active
ON customer
FOR SELECT
USING (record_status = 'ACTIVE');

-- ADMIN and SUPERADMIN roles: can see all customers
CREATE POLICY admin_super_select_all
ON customer
FOR SELECT
TO admin, superadmin
USING (true);

-- INSERT allowed if user has CUST_ADD right
CREATE POLICY user_insert_customer
ON customer
FOR INSERT
USING (EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = current_user
      AND rightname = 'CUST_ADD'
      AND value = 1
));

-- UPDATE edit allowed if user has CUST_EDIT right
CREATE POLICY user_update_customer
ON customer
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = current_user
      AND rightname = 'CUST_EDIT'
      AND value = 1
));

-- UPDATE deactivate allowed if user has CUST_DEL right
CREATE POLICY user_deactivate_customer
ON customer
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = current_user
      AND rightname = 'CUST_DEL'
      AND value = 1
))
WITH CHECK (record_status = 'INACTIVE');

-- UPDATE recover allowed for ADMIN/SUPERADMIN
CREATE POLICY admin_recover_customer
ON customer
FOR UPDATE
TO admin, superadmin
WITH CHECK (record_status = 'ACTIVE');
