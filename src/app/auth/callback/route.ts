import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@lib/supabase/server";

// Yalnızca site-içi path'lere izin ver — harici URL yönlendirmesini engelle
const ALLOWED_PATHS = ["/", "/en", "/profile", "/en/profile", "/onboarding", "/en/onboarding", "/films", "/en/films", "/festivals", "/en/festivals"];

function safeRedirectPath(value: string | null): string {
  if (!value) return "/profile";
  // Protocol veya başka domain içeriyorsa reddet
  if (
    value.includes("://") ||
    value.startsWith("//") ||
    !value.startsWith("/")
  ) {
    return "/profile";
  }
  // Yalnızca izin verilen path prefix'leri kabul et
  const allowed = ALLOWED_PATHS.some((p) => value === p || value.startsWith(p + "/"));
  return allowed ? value : "/profile";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const next = safeRedirectPath(nextParam);
  const redirectTo = next === "/en/profile" ? "/en/onboarding" : next === "/profile" ? "/onboarding" : next || "/";
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
