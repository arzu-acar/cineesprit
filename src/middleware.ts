import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through API routes, auth callbacks, admin, static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/signout") ||
    pathname.startsWith("/admin")
  ) {
    let supabaseResponse = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (pathname.startsWith("/admin")) {
      const role = user?.app_metadata?.role;
      if (!user || role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return supabaseResponse;
  }

  // Redirect /tr/... → /... (TR is the default, no prefix needed)
  if (pathname === "/tr" || pathname.startsWith("/tr/")) {
    const rest = pathname.slice(3); // strip "/tr"
    return NextResponse.redirect(new URL(rest || "/", request.url), 308);
  }

  // Apply intl middleware (adds locale prefix, redirects / → /tr)
  const intlResponse = intlMiddleware(request);

  // Add x-pathname header so server actions can detect locale
  const response = intlResponse ?? NextResponse.next({ request });
  response.headers.set("x-pathname", pathname);

  // Supabase session refresh for locale-prefixed routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
