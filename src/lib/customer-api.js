import { supabase } from "./supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check your Vite environment variables.");
  }
}

function makeStamp(action) {
  return `${action}:${new Date().toISOString()}`.slice(0, 60);
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

export async function addCustomer(customer) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .insert({
      custno: customer.custno,
      custname: customer.custname,
      address: customer.address,
      payterm: customer.payterm,
      record_status: "ACTIVE",
      stamp: makeStamp("CREATED"),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(custNo, updates) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      stamp: makeStamp("UPDATED"),
    })
    .eq("custno", custNo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeleteCustomer(custNo) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .update({
      record_status: "INACTIVE",
      updated_at: new Date().toISOString(),
      stamp: makeStamp("DEACTIVATED"),
    })
    .eq("custno", custNo)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function recoverCustomer(custNo) {
  requireSupabase();

  const { data, error } = await supabase
    .from("customer")
    .update({
      record_status: "ACTIVE",
      updated_at: new Date().toISOString(),
      stamp: makeStamp("REACTIVATED"),
    })
    .eq("custno", custNo)
    .select()
    .single();

  if (error) throw error;
  return data;
}
