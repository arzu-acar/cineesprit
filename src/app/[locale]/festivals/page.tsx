import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { NavBar } from "@components/NavBar";
import { FestivalCard } from "@components/FestivalCard";
import { FestivalFilters } from "@components/FestivalFilters";
import { SectionTitle } from "@components/ui/SectionTitle";
import { getFestivals, getFestivalCountries } from "@lib/supabase/festivals";
import type { FestivalStatus } from "@lib/supabase/festivals";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cineesprit.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.festivals" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}/festivals`,
      type: "website",
      locale: locale === "en" ? "en_US" : "tr_TR",
    },
  };
}

type SearchParams = { status?: string; country?: string };

export default async function FestivalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, locale, t, tFestivals] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("festivals"),
    getTranslations("festivals"),
  ]);

  const status = (params.status ?? "") as FestivalStatus | "";
  const country = params.country ?? "";

  const [festivals, countries] = await Promise.all([
    getFestivals({ status: status || undefined, country: country || undefined }),
    getFestivalCountries(),
  ]);

  const hasFilters = !!(status || country);
  const metaLabel =
    festivals.length === 0
      ? t("noResults")
      : t("festivalCount", { count: festivals.length });

  return (
    <>
      <NavBar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle title={t("title")} meta={metaLabel} index="04" />

        <div className="mb-10">
          <Suspense>
            <FestivalFilters status={status} country={country} countries={countries} />
          </Suspense>
        </div>

        {festivals.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            emptyFilteredText={t("emptyFiltered")}
            emptyAllText={t("emptyAll")}
            clearFiltersText={t("clearFilters")}
            clearHref={`/${locale}/festivals`}
            noResultsLabel={t("noResults")}
          />
        ) : (
          <FestivalGrid
            festivals={festivals}
            ongoingLabel={t("ongoing")}
            upcomingLabel={t("upcoming")}
            pastLabel={t("past")}
          />
        )}
      </main>

      <footer className="border-t border-ce-border mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 flex items-center justify-between sm:px-6">
          <span className="font-serif italic text-ce-text-secondary text-[15px]">CineEsprit</span>
          <p className="font-mono text-[10px] tracking-[0.1em] text-ce-muted uppercase">
            {locale === "en" ? "Independent · Auteur · Experimental" : "Bağımsız · Auteur · Deneysel"}
          </p>
        </div>
      </footer>
    </>
  );
}

function FestivalGrid({
  festivals,
  ongoingLabel,
  upcomingLabel,
  pastLabel,
}: {
  festivals: Awaited<ReturnType<typeof getFestivals>>;
  ongoingLabel: string;
  upcomingLabel: string;
  pastLabel: string;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const ongoing = festivals.filter((f) => f.start_date <= today && f.end_date >= today);
  const upcoming = festivals.filter((f) => f.start_date > today);
  const past = festivals.filter((f) => f.end_date < today);

  const hasGroups = ongoing.length > 0 || upcoming.length > 0;

  if (!hasGroups) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {past.map((f) => <FestivalCard key={f.id} festival={f} />)}
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {ongoing.length > 0 && (
        <section>
          <p className="mb-5 font-mono text-[10px] tracking-[0.2em] text-ce-accent uppercase">
            {ongoingLabel}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ongoing.map((f) => <FestivalCard key={f.id} festival={f} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <p className="mb-5 font-mono text-[10px] tracking-[0.2em] text-ce-text-secondary uppercase">
            {upcomingLabel}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((f) => <FestivalCard key={f.id} festival={f} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <p className="mb-5 font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase">
            {pastLabel}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((f) => <FestivalCard key={f.id} festival={f} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState({
  hasFilters,
  emptyFilteredText,
  emptyAllText,
  clearFiltersText,
  clearHref,
  noResultsLabel,
}: {
  hasFilters: boolean;
  emptyFilteredText: string;
  emptyAllText: string;
  clearFiltersText: string;
  clearHref: string;
  noResultsLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="font-mono text-[11px] tracking-[0.2em] text-ce-accent mb-4 uppercase">
        {noResultsLabel}
      </p>
      <p className="font-serif italic text-[28px] text-ce-text mb-3">
        {hasFilters ? emptyFilteredText : emptyAllText}
      </p>
      {hasFilters && (
        <a
          href={clearHref}
          className="mt-6 font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
        >
          {clearFiltersText}
        </a>
      )}
    </div>
  );
}
