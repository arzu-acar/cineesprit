import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthForm } from "@components/AuthForm";
import { createSupabaseServerClient } from "@lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.auth" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

type SearchParams = {
  mode?: string;
  error?: string;
  success?: string;
  email?: string;
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/profile`);

  const mode = params.mode === "register" ? "register" : "login";
  const error = params.error ?? undefined;
  const success = params.success ?? undefined;
  const email = params.email ?? "";

  return (
    <div className="min-h-screen flex">
      {/* Left: editorial panel */}
      <div
        className="hidden lg:flex lg:flex-col lg:justify-between lg:flex-1 border-r border-[#1c1c1c] px-12 py-12"
        style={{
          background: "repeating-linear-gradient(135deg, #0d0d0d 0 14px, #0a0a0a 14px 28px)",
        }}
      >
        <a
          href={locale === "en" ? "/en" : "/"}
          className="font-serif italic text-[26px] text-ce-text hover:text-ce-accent transition-colors"
        >
          CineEsprit
        </a>

        <div>
          <p className="mb-6 font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase">
            {locale === "en" ? "Cinemathèque · Catalogue · Festival Calendar" : "Sinematek · Katalog · Festival Takvimi"}
          </p>
          <h2 className="mb-5 font-serif text-[38px] italic font-normal leading-[1.15] text-ce-text max-w-[400px]">
            {locale === "en"
              ? "Enter the archive of independent cinema."
              : "Bağımsız sinemanın arşivine giriş yap."}
          </h2>
          <p className="text-[14px] leading-[1.7] text-ce-text-secondary max-w-[380px]">
            {locale === "en"
              ? "A curated catalogue of auteur, experimental and festival cinema. Build your watchlist, follow festivals."
              : "Auteur, deneysel ve festival sinemasından özenle seçilmiş bir katalog. İzleme listeni oluştur, festivalleri takip et."}
          </p>
        </div>

        <div className="flex gap-2">
          <span className="border border-ce-accent px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-ce-accent uppercase">
            Auteur
          </span>
          <span className="border border-[#2e2e2e] px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-[#8a8a88] uppercase">
            {locale === "en" ? "Experimental" : "Deneysel"}
          </span>
          <span className="border border-[#2e2e2e] px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-[#8a8a88] uppercase">
            Festival
          </span>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-[380px]">
          <a
            href={locale === "en" ? "/en" : "/"}
            className="mb-10 block font-serif italic text-[22px] text-ce-text hover:text-ce-accent transition-colors lg:hidden"
          >
            CineEsprit
          </a>

          <AuthForm
            initialMode={mode}
            initialEmail={email}
            error={error}
            success={success}
          />
        </div>
      </div>
    </div>
  );
}
