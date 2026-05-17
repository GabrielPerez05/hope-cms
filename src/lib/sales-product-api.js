import { supabase } from "./supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check your Vite environment variables.");
  }
}

export async function getProducts() {
  requireSupabase();

  const { data, error } = await supabase
    .from("product")
    .select("*")
    .order("prodcode");

  if (error) throw error;
  return data || [];
}

export async function getSales() {
  requireSupabase();

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("salesdate", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllSalesDetail() {
  requireSupabase();

  const { data, error } = await supabase
    .from("salesdetail")
    .select("*")
    .order("transno");

  if (error) throw error;
  return data || [];
}

export async function getPriceHistory() {
  requireSupabase();

  const { data, error } = await supabase
    .from("pricehist")
    .select("*")
    .order("effdate", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCurrentPrice(prodCode) {
  requireSupabase();

  const { data, error } = await supabase
    .from("pricehist")
    .select("*")
    .eq("prodcode", prodCode)
    .order("effdate", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSalesByCustomer(custNo) {
  requireSupabase();

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("custno", custNo)
    .order("salesdate", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSalesDetail(transNo) {
  requireSupabase();

  const { data, error } = await supabase
    .from("salesdetail")
    .select("*")
    .eq("transno", transNo)
    .order("prodcode");

  if (error) throw error;
  return data || [];
}
