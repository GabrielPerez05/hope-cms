import { supabase } from "./supabase";

const MODULES = ["Customers", "Sales", "Products", "Admin"];
const RIGHTS = [
  "CUST_VIEW",
  "CUST_ADD",
  "CUST_EDIT",
  "CUST_DEL",
  "SALES_VIEW",
  "SD_VIEW",
  "PROD_VIEW",
  "PRICE_VIEW",
  "ADM_USER",
];

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check your Vite environment variables.");
  }
}

function normalizeModules(rows) {
  return MODULES.reduce((map, moduleName) => {
    const row = rows.find((item) => item.module_name === moduleName);
    map[moduleName] = Boolean(row?.is_active);
    return map;
  }, {});
}

function normalizeRights(rows) {
  return RIGHTS.reduce((map, rightName) => {
    const row = rows.find((item) => item.right_name === rightName);
    map[rightName] = row?.right_value === 1;
    return map;
  }, {});
}

export async function getAdminUsers() {
  requireSupabase();

  const [{ data: users, error: usersError }, { data: modules, error: modulesError }, { data: rights, error: rightsError }] =
    await Promise.all([
      supabase.from("user").select("*").order("email"),
      supabase.from("user_module").select("*"),
      supabase.from("user_rights").select("*"),
    ]);

  if (usersError) throw usersError;
  if (modulesError) throw modulesError;
  if (rightsError) throw rightsError;

  return (users || []).map((user) => {
    const userId = user.userId;
    return {
      ...user,
      modules: normalizeModules((modules || []).filter((row) => row.userId === userId)),
      rights: normalizeRights((rights || []).filter((row) => row.userId === userId)),
    };
  });
}

export async function updateAdminUser(userId, updates) {
  requireSupabase();

  const { data, error } = await supabase
    .from("user")
    .update(updates)
    .eq("userId", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserModule(userId, moduleName, isActive) {
  requireSupabase();

  const { error } = await supabase.from("user_module").upsert(
    {
      userId,
      module_name: moduleName,
      is_active: isActive,
    },
    { onConflict: "userId,module_name" },
  );

  if (error) throw error;
}

export async function updateUserRight(userId, rightName, isEnabled) {
  requireSupabase();

  const { error } = await supabase.from("user_rights").upsert(
    {
      userId,
      right_name: rightName,
      right_value: isEnabled ? 1 : 0,
    },
    { onConflict: "userId,right_name" },
  );

  if (error) throw error;
}

// CUST_DEL is excluded from the panel because soft-delete is always gated
// by userType === "SUPERADMIN" in code — the checkbox has no functional effect
// for any non-SUPERADMIN account, and SUPERADMIN rows are protected anyway.
const DISPLAY_RIGHTS = RIGHTS.filter((r) => r !== "CUST_DEL");

export { MODULES, RIGHTS, DISPLAY_RIGHTS };
