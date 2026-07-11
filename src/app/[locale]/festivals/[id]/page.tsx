import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NavBar } from "@components/NavBar";
import { getFestivalById } from "@lib/supabase/festivals";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cineesprit.com";

type PageProps = { params: Promise<{ id: string; locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const festival = await getFestivalById(id);
  if (!festival) return { title: "Festival — CineEsprit" };
  return {
    title: festival.name,
    description: festival.description ?? undefined,
    openGraph: {
      title: `${festival.name} — CineEsprit`,
      description: festival.description ?? undefined,
      url: `${BASE_URL}/${locale}/festivals/${id}`,
      images: festival.cover_url ? [{ url: festival.cover_url }] : [],
      locale: locale === "en" ? "en_US" : "tr_TR",
    },
  };
}

function formatDateRange(start: string, end: string, locale: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const intlLocale = locale === "en" ? "en-GB" : "tr-TR";
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${s.toLocaleDateString(intlLocale, opts)} – ${e.toLocaleDateString(intlLocale, { ...opts, year: "numeric" })}`;
}

export default async function FestivalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [locale, t] = await Promise.all([getLocale(), getTranslations("festivals")]);

  const festival = await getFestivalById(id);
  if (!festival) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const status =
    festival.start_date > today
      ? "upcoming"
      : festival.end_date >= today
      ? "ongoing"
      : "past";

  const statusLabel =
    status === "ongoing" ? t("statusOngoing") : status === "upcoming" ? t("statusUpcoming") : t("statusPast");
  const statusColor =
    status === "ongoing"
      ? "border-ce-accent text-ce-accent"
      : status === "upcoming"
      ? "border-[#3a3a3a] text-[#c8c8c6]"
      : "border-ce-border text-ce-muted";

  const dateRange = formatDateRange(festival.start_date, festival.end_date, locale);

  return (
    <>
      <NavBar />

      {festival.cover_url ? (
        <section className="relative h-[40vh] min-h-[260px] overflow-hidden border-b border-ce-border bg-ce-panel">
          <Image
            src={festival.cover_url}
            alt={festival.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ce-bg via-ce-bg/30 to-transparent" />
        </section>
      ) : (
        <div className="h-[1px] bg-ce-border" />
      )}

      <main className="mx-auto max-w-4xl px-6 py-14">
        <Link
          href="/festivals"
          className="mb-10 inline-block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
        >
          {t("back")}
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <p className="font-mono text-[11px] tracking-[0.16em] text-ce-muted uppercase">
            {festival.country.toUpperCase()} · {festival.location}
          </p>
          <span
            className={`border px-2 py-1 font-mono text-[9px] tracking-[0.12em] uppercase ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        <h1 className="mb-4 font-serif text-[46px] font-normal italic leading-[1.08] text-ce-text">
          {festival.name}
        </h1>

        <p className="mb-8 font-mono text-[12px] tracking-[0.12em] text-ce-muted">
          {dateRange}
        </p>

        {festival.description && (
          <div className="border-t border-ce-border pt-8">
            <p className="max-w-2xl text-[15px] leading-[1.8] text-ce-text-secondary">
              {festival.description}
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-ce-border mt-16">
        <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
          <span className="font-serif italic text-ce-text-secondary text-[15px]">CineEsprit</span>
          <p className="font-mono text-[10px] tracking-[0.1em] text-ce-muted uppercase">
            {locale === "en" ? "Independent · Auteur · Experimental" : "Bağımsız · Auteur · Deneysel"}
          </p>
        </div>
      </footer>
    </>
  );
}
