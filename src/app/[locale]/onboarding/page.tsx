import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { OnboardingForm } from "@components/OnboardingForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tercihler — CineEsprit",
};

export default async function OnboardingPage() {
  const [locale, supabase] = await Promise.all([getLocale(), createSupabaseServerClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (prefs?.onboarding_completed) redirect(`/${locale}`);

  return <OnboardingForm />;
}
