"use server";

import { createSupabaseServerClient } from "@lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleWatched(filmId: number): Promise<{ watched: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açmanız gerekiyor.");

  const { data: existing } = await supabase
    .from("watch_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("film_id", filmId)
    .maybeSingle();

  if (existing) {
    await supabase.from("watch_history").delete().eq("id", existing.id);
    revalidatePath(`/films/${filmId}`);
    revalidatePath(`/en/films/${filmId}`);
    return { watched: false };
  }

  const { error: insertError } = await supabase
    .from("watch_history")
    .insert({ user_id: user.id, film_id: filmId });
  if (insertError) throw new Error("İzleme geçmişi güncellenemedi.");
  revalidatePath(`/tr/films/${filmId}`);
  revalidatePath(`/en/films/${filmId}`);
  return { watched: true };
}

export async function toggleFavorite(filmId: number): Promise<{ favorited: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum açmanız gerekiyor.");

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("film_id", filmId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    revalidatePath(`/films/${filmId}`);
    revalidatePath(`/en/films/${filmId}`);
    return { favorited: false };
  }

  const { error: insertError } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, film_id: filmId });
  if (insertError) throw new Error("Favoriler güncellenemedi.");
  revalidatePath(`/tr/films/${filmId}`);
  revalidatePath(`/en/films/${filmId}`);
  return { favorited: true };
}
