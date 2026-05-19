-- Fix: cast target_user_id to UUID so it matches the "userId" column type.
CREATE OR REPLACE FUNCTION set_role_rights(target_user_id TEXT, new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rights_map   JSONB;
  v_right_name TEXT;
  v_right_val  INT;
BEGIN
  IF new_role = 'SUPERADMIN' THEN
    rights_map := '{"CUST_VIEW":1,"CUST_ADD":1,"CUST_EDIT":1,"CUST_DEL":1,"SALES_VIEW":1,"SD_VIEW":1,"PROD_VIEW":1,"PRICE_VIEW":1,"ADM_USER":1}';
  ELSIF new_role = 'ADMIN' THEN
    rights_map := '{"CUST_VIEW":1,"CUST_ADD":1,"CUST_EDIT":1,"CUST_DEL":0,"SALES_VIEW":1,"SD_VIEW":1,"PROD_VIEW":1,"PRICE_VIEW":1,"ADM_USER":1}';
  ELSIF new_role = 'USER' THEN
    rights_map := '{"CUST_VIEW":1,"CUST_ADD":0,"CUST_EDIT":0,"CUST_DEL":0,"SALES_VIEW":1,"SD_VIEW":1,"PROD_VIEW":1,"PRICE_VIEW":1,"ADM_USER":0}';
  ELSE
    RAISE EXCEPTION 'Unknown role: %', new_role;
  END IF;

  FOR v_right_name, v_right_val IN SELECT key, value::int FROM jsonb_each_text(rights_map)
  LOOP
    INSERT INTO user_rights ("userId", right_name, right_value)
    VALUES (target_user_id::uuid, v_right_name, v_right_val)
    ON CONFLICT ("userId", right_name)
    DO UPDATE SET right_value = EXCLUDED.right_value;
  END LOOP;
END;
$$;
