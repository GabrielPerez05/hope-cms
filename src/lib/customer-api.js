import { supabase } from "./supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check your Vite environment variables.");
  }
}

function makeStamp(action, note = "", user = null) {
  // Column is VARCHAR(60) — budget carefully.
  const ts = new Date().toISOString().slice(0, 16) + "Z"; // "2026-05-20T01:11Z"
  const base = `${action}:${ts}`;

  let byPart = null;
  if (user) {
    const rawName = user.username || (user.email || "").split("@")[0] || "?";
    const name = rawName.split(".")[0].slice(0, 12);
    byPart = `by:${name}(${user.user_type || "?"})`;
  }

  const byLen = byPart ? byPart.length + 1 : 0; // +1 for pipe
  const noteSlot = 60 - base.length - byLen - (note ? 1 : 0); // -1 for pipe
  const parts = [base];
  if (note && noteSlot > 0) parts.push(note.trim().slice(0, noteSlot));
  if (byPart) parts.push(byPart);
  return parts.join("|");
}

export async function getCustomers(userType = "USER") {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .select("*")
    .order("custno");
  if (error) throw error;

  const customers = data || [];
  if (userType !== "USER") return customers;

  return customers.filter(
    (customer) => (customer.record_status || "ACTIVE") === "ACTIVE",
  );
}

export async function addCustomer(customer, user = null) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .insert({
      custno: customer.custno,
      custname: customer.custname,
      address: customer.address,
      payterm: customer.payterm,
      record_status: "ACTIVE",
      stamp: makeStamp("CREATED", "", user),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(custNo, updates, changedFields = "", user = null, prevSnapshot = null) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      stamp: makeStamp("UPDATED", changedFields, user),
      prev_snapshot: prevSnapshot ?? null,
    })
    .eq("custno", custNo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function revertCustomer(custNo, snapshot, user = null) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .update({
      custname: snapshot.custname,
      address: snapshot.address,
      payterm: snapshot.payterm,
      updated_at: new Date().toISOString(),
      stamp: makeStamp("REVERTED", "", user),
      prev_snapshot: null,
    })
    .eq("custno", custNo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeleteCustomer(custNo, reason = "", user = null) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .update({
      record_status: "INACTIVE",
      updated_at: new Date().toISOString(),
      stamp: makeStamp("DEACTIVATED", reason, user),
    })
    .eq("custno", custNo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function recoverCustomer(custNo, user = null) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .update({
      record_status: "ACTIVE",
      updated_at: new Date().toISOString(),
      stamp: makeStamp("REACTIVATED", "", user),
    })
    .eq("custno", custNo)
    .select()
    .single();

  if (error) throw error;
  return data;
}
