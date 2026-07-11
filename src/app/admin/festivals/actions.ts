"use server";

import { requireAdmin } from "@lib/supabase/admin";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { FestivalSchema } from "@lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFestival(formData: FormData) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") ?? ""),
    description: String(formData.get("description") ?? "").trim() || undefined,
    cover_url: String(formData.get("cover_url") ?? "").trim() || undefined,
  };

  const parsed = FestivalSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Geçersiz form verisi.");
  }

  const { error } = await supabase.from("festivals").insert({
    ...parsed.data,
    description: parsed.data.description || null,
    cover_url: parsed.data.cover_url || null,
  });
  if (error) throw new Error("Festival kaydedilemedi. Lütfen tekrar deneyin.");

  revalidatePath("/admin/festivals");
  revalidatePath("/festivals");
  redirect("/admin/festivals");
}

export async function updateFestival(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") ?? ""),
    description: String(formData.get("description") ?? "").trim() || undefined,
    cover_url: String(formData.get("cover_url") ?? "").trim() || undefined,
  };

  const parsed = FestivalSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Geçersiz form verisi.");
  }

  const { error } = await supabase
    .from("festivals")
    .update({
      ...parsed.data,
      description: parsed.data.description || null,
      cover_url: parsed.data.cover_url || null,
    })
    .eq("id", id);
  if (error) throw new Error("Festival güncellenemedi. Lütfen tekrar deneyin.");

  revalidatePath("/admin/festivals");
  revalidatePath("/festivals");
  redirect("/admin/festivals");
}

export async function deleteFestival(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("festivals").delete().eq("id", id);
  if (error) throw new Error("Festival silinemedi.");
  revalidatePath("/admin/festivals");
  revalidatePath("/festivals");
}
