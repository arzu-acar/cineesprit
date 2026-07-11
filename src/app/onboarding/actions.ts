"use server";

import { createSupabaseServerClient } from "@lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocaleFromHeaders, localePath } from "@lib/locale";

export type OnboardingData = {
  categories: string[];
  countries: string[];
  directors: string[];
};

export async function saveOnboarding(data: OnboardingData) {
  const [locale, supabase] = await Promise.all([
    getLocaleFromHeaders(),
    createSupabaseServerClient(),
  ]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(localePath(locale, "/auth"));

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      categories: data.categories,
      countries: data.countries,
      directors: data.directors,
      onboarding_completed: true,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error("Tercihler kaydedilemedi. Lütfen tekrar deneyin.");
  redirect(localePath(locale, "/"));
}
