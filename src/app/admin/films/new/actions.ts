"use server";

import { requireAdmin } from "@lib/supabase/admin";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { getFilmDetails } from "@lib/tmdb/client";
import { CurateFilmSchema } from "@lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function curateFilm(formData: FormData) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const raw = {
    tmdb_id: String(formData.get("tmdb_id") ?? "").trim(),
    curator_note: String(formData.get("curator_note") ?? "").trim() || undefined,
    tags: String(formData.get("tags") ?? "").trim() || undefined,
    featured: formData.get("featured") === "on",
  };

  const parsed = CurateFilmSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Geçersiz form verisi.");
  }

  const { tmdb_id, curator_note, tags: rawTags, featured } = parsed.data;

  const tags = rawTags
    ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // TMDB'den doğrula
  await getFilmDetails(tmdb_id);

  const { error } = await supabase.from("curated_films").upsert(
    { tmdb_id, curator_note: curator_note || null, tags, featured },
    { onConflict: "tmdb_id" }
  );

  if (error) throw new Error("Film kaydedilemedi. Lütfen tekrar deneyin.");

  revalidatePath("/admin/films");
  redirect("/admin/films");
}
