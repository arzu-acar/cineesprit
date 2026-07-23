import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@lib/supabase/server";

function safeRedirectPath(value: string | null): string {
  if (!value) return "/profile";
  if (
    value.includes("://") ||
    value.startsWith("//") ||
    !value.startsWith("/")
  ) {
    return "/profile";
  }
  // Only allow known internal path prefixes
  const segments = value.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  const validLocales = ["tr", "en"];
  if (validLocales.includes(segments[0])) return value;
  const validRoots = ["profile", "onboarding", "films", "festivals"];
  if (validRoots.includes(segments[0])) return value;
  return "/profile";
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
  const isNewUserPath = next === "/profile" || next === "/en/profile" || next === "/tr/profile";
  const redirectTo = isNewUserPath
    ? next.replace("/profile", "/onboarding")
    : next || "/";
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
