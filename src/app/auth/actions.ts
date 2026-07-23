"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { AuthSchema } from "@lib/validations";
import { getLocaleFromHeaders, localePath } from "@lib/locale";

function safeNext(value: string): string {
  if (!value || !value.startsWith("/") || value.includes("://") || value.startsWith("//")) {
    return "";
  }
  return value;
}

export async function signInWithEmail(formData: FormData) {
  const locale = await getLocaleFromHeaders();
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const next = safeNext(String(formData.get("next") ?? "").trim());

  const parsed = AuthSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Geçersiz form verisi.";
    const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`${localePath(locale, "/auth")}?error=${encodeURIComponent(msg)}&mode=login&email=${encodeURIComponent(raw.email)}${nextParam}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`${localePath(locale, "/auth")}?error=${encodeURIComponent("E-posta veya şifre hatalı.")}&mode=login&email=${encodeURIComponent(raw.email)}${nextParam}`);
  }
  redirect(next || localePath(locale, "/profile"));
}

export async function signUpWithEmail(formData: FormData) {
  const locale = await getLocaleFromHeaders();
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = AuthSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Geçersiz form verisi.";
    redirect(`${localePath(locale, "/auth")}?error=${encodeURIComponent(msg)}&mode=register&email=${encodeURIComponent(raw.email)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    redirect(`${localePath(locale, "/auth")}?error=${encodeURIComponent("Kayıt tamamlanamadı. Lütfen tekrar deneyin.")}&mode=register&email=${encodeURIComponent(raw.email)}`);
  }
  redirect(`${localePath(locale, "/auth")}?success=confirm&mode=register&next=${localePath(locale, "/onboarding")}`);
}

export async function signInWithGoogle(formData: FormData) {
  const locale = await getLocaleFromHeaders();
  const next = safeNext(String(formData.get("next") ?? "").trim());
  const supabase = await createSupabaseServerClient();
  const callbackBase = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`;
  const redirectTo = next ? `${callbackBase}?next=${encodeURIComponent(next)}` : callbackBase;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    redirect(`${localePath(locale, "/auth")}?error=${encodeURIComponent("Google ile giriş başarısız")}`);
  }
  redirect(data.url);
}
