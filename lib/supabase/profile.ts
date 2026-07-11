import { createSupabaseServerClient } from "./server";

export type WatchHistoryEntry = {
  id: string;
  film_id: number;
  watched_at: string;
};

export type FavoriteEntry = {
  id: string;
  film_id: number;
  created_at: string;
};

export type UserProfile = {
  id: string;
  email: string | undefined;
  created_at: string;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  };
}

export async function getWatchHistory(userId: string): Promise<WatchHistoryEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("watch_history")
    .select("id, film_id, watched_at")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as WatchHistoryEntry[];
}

export async function getFavorites(userId: string): Promise<FavoriteEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("id, film_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as FavoriteEntry[];
}
