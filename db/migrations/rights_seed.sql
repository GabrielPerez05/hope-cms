-- Seed Modules
INSERT INTO module (module_code, module_name) VALUES
('Cust_Mod','Customer Module'),
('Sales_Mod','Sales Module'),
('Prod_Mod','Product Module'),
('Adm_Mod','Admin Module');

-- Seed Rights
INSERT INTO rights (right_code, right_name) VALUES
('CUST_VIEW','Customer View'),
('CUST_ADD','Customer Add'),
('CUST_EDIT','Customer Edit'),
('CUST_DEL','Customer Delete'),
('SALES_VIEW','Sales View'),
('SD_VIEW','SalesDetail View'),
('PROD_VIEW','Product View'),
('PRICE_VIEW','Price View'),
('ADM_USER','Admin User');

-- Seed SUPERADMIN user
INSERT INTO users (email) VALUES ('jcesperanza@neu.edu.ph');

-- Assign all 9 rights to SUPERADMIN
INSERT INTO user_module_rights (user_email, right_code) VALUES
('jcesperanza@neu.edu.ph','CUST_VIEW'),
('jcesperanza@neu.edu.ph','CUST_ADD'),
('jcesperanza@neu.edu.ph','CUST_EDIT'),
('jcesperanza@neu.edu.ph','CUST_DEL'),
('jcesperanza@neu.edu.ph','SALES_VIEW'),
('jcesperanza@neu.edu.ph','SD_VIEW'),
('jcesperanza@neu.edu.ph','PROD_VIEW'),
('jcesperanza@neu.edu.ph','PRICE_VIEW'),
('jcesperanza@neu.edu.ph','ADM_USER');
