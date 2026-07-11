import { createSupabaseServerClient } from "./server";
import type { Festival } from "@components/FestivalCard";

export type FestivalStatus = "upcoming" | "ongoing" | "past" | "all";

export type FestivalFilters = {
  status?: FestivalStatus;
  country?: string;
};

export async function getUpcomingFestivals(limit = 4): Promise<Festival[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("festivals")
    .select("id, name, country, city, start_date, end_date, description, logo_url, website_url")
    .eq("is_active", true)
    .gte("end_date", today)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getUpcomingFestivals]", error.message);
    return [];
  }
  return (data ?? []) as Festival[];
}

export async function getFestivals(filters: FestivalFilters = {}): Promise<Festival[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("festivals")
    .select("id, name, country, city, start_date, end_date, description, logo_url, website_url")
    .eq("is_active", true)
    .order("start_date", { ascending: true });

  if (filters.status === "upcoming") {
    query = query.gt("start_date", today);
  } else if (filters.status === "ongoing") {
    query = query.lte("start_date", today).gte("end_date", today);
  } else if (filters.status === "past") {
    query = query.lt("end_date", today);
  }

  if (filters.country) {
    query = query.ilike("country", filters.country);
  }

  const { data, error } = await query;
  if (error) {
    return [];
  }
  return (data ?? []) as Festival[];
}

export async function getFestivalById(id: string): Promise<Festival | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("festivals")
    .select("id, name, country, city, start_date, end_date, description, logo_url, website_url")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getFestivalById]", error.message);
    return null;
  }
  return (data ?? null) as Festival | null;
}

export async function getFestivalCountries(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("festivals")
    .select("country")
    .eq("is_active", true)
    .order("country", { ascending: true });

  if (error) {
    console.error("[getFestivalCountries]", error.message);
    return [];
  }

  const unique = [...new Set(data.map((r: { country: string }) => r.country))];
  return unique;
}
