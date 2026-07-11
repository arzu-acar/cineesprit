import { createSupabaseServerClient } from "./server";

export async function isInWatchHistory(
  userId: string,
  filmId: number
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("watch_history")
    .select("id")
    .eq("user_id", userId)
    .eq("film_id", filmId)
    .maybeSingle();
  return !!data;
}

export async function isInFavorites(
  userId: string,
  filmId: number
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("film_id", filmId)
    .maybeSingle();
  return !!data;
}
