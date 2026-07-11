import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function NavBar() {
  const [t, locale, supabase] = await Promise.all([
    getTranslations("nav"),
    getLocale(),
    createSupabaseServerClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navLinks = [
    { label: t("films"), href: "/films" as const },
    { label: t("festivals"), href: "/festivals" as const },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ce-border bg-ce-bg/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-[22px] italic leading-none text-ce-text transition-colors hover:text-ce-accent"
        >
          CineEsprit
        </Link>

        <ul className="flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase transition-colors hover:text-ce-text"
              >
                {label}
              </Link>
            </li>
          ))}

          <li>
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-ce-accent uppercase transition-colors hover:text-ce-text"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-ce-accent" />
                {user.email?.split("@")[0]}
              </Link>
            ) : (
              <Link
                href="/auth"
                className="font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase transition-colors hover:text-ce-text"
              >
                {t("login")}
              </Link>
            )}
          </li>

          <li>
            <LocaleSwitcher currentLocale={locale} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
