import { supabase } from "./supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check your Vite environment variables.");
  }
}

export async function getCustomerSalesSummary() {
  requireSupabase();
  const { data, error } = await supabase
    .from("customer_sales_summary")
    .select("*")
    .order("total_spend", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTopCustomers(limit = 10) {
  requireSupabase();
  const { data, error } = await supabase
    .from("customer_sales_summary")
    .select("*")
    .eq("record_status", "ACTIVE")
    .order("total_spend", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getProductRevenue() {
  requireSupabase();
  const { data, error } = await supabase
    .from("product_revenue")
    .select("*")
    .order("total_revenue", { ascending: false });
  if (error) throw error;
  return data || [];
}
