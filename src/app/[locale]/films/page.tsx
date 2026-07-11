import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { NavBar } from "@components/NavBar";
import { FilmCard } from "@components/ui/FilmCard";
import { FilmFilters } from "@components/FilmFilters";
import { SectionTitle } from "@components/ui/SectionTitle";
import { discoverFilms } from "@lib/tmdb/client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cineesprit.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.films" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}/films`,
      type: "website",
      locale: locale === "en" ? "en_US" : "tr_TR",
    },
  };
}

type SearchParams = {
  q?: string;
  genre?: string;
  year?: string;
  language?: string;
  page?: string;
};

export default async function FilmsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [params, locale, t] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("films"),
  ]);

  const query = params.q ?? "";
  const genre = params.genre ?? "";
  const year = params.year ?? "";
  const language = params.language ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));

  const { results: films, totalPages } = await discoverFilms({
    query,
    genreId: genre,
    year,
    language,
    page,
    locale,
  });

  const hasFilters = !!(query || genre || year || language);
  const resultLabel =
    films.length === 0
      ? t("noResults")
      : t("filmCount", { count: films.length });

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (genre) sp.set("genre", genre);
    if (year) sp.set("year", year);
    if (language) sp.set("language", language);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/${locale}/films${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <NavBar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle
          title={t("title")}
          meta={resultLabel}
          index="02"
        />

        <div className="mb-10">
          <Suspense>
            <FilmFilters
              query={query}
              genre={genre}
              year={year}
              language={language}
            />
          </Suspense>
        </div>

        {films.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            emptyFilteredText={t("emptyFiltered")}
            emptyCatalogText={t("emptyCatalog")}
            clearFiltersText={t("clearFilters")}
            clearHref={`/${locale}/films`}
            noResultsLabel={t("noResults")}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {films.map((film) => (
                <FilmCard
                  key={film.id}
                  id={film.id}
                  title={film.title}
                  posterPath={film.poster_path}
                  year={
                    film.release_date
                      ? Number(film.release_date.slice(0, 4))
                      : undefined
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                pageHref={pageHref}
                prevLabel={t("prevPage")}
                nextLabel={t("nextPage")}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-ce-border mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 flex items-center justify-between sm:px-6">
          <span className="font-serif italic text-ce-text-secondary text-[15px]">
            CineEsprit
          </span>
          <p className="font-mono text-[10px] tracking-[0.1em] text-ce-muted uppercase">
            {locale === "en" ? "Independent · Auteur · Experimental" : "Bağımsız · Auteur · Deneysel"}
          </p>
        </div>
      </footer>
    </>
  );
}

function EmptyState({
  hasFilters,
  emptyFilteredText,
  emptyCatalogText,
  clearFiltersText,
  clearHref,
  noResultsLabel,
}: {
  hasFilters: boolean;
  emptyFilteredText: string;
  emptyCatalogText: string;
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
        {hasFilters ? emptyFilteredText : emptyCatalogText}
      </p>
      {hasFilters && (
        <Link
          href={clearHref}
          className="mt-6 font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
        >
          {clearFiltersText}
        </Link>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  pageHref,
  prevLabel,
  nextLabel,
}: {
  page: number;
  totalPages: number;
  pageHref: (p: number) => string;
  prevLabel: string;
  nextLabel: string;
}) {
  const capped = Math.min(totalPages, 500);

  return (
    <div className="mt-14 flex items-center justify-between border-t border-ce-border pt-8">
      <div>
        {page > 1 && (
          <Link
            href={pageHref(page - 1)}
            className="font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
          >
            {prevLabel}
          </Link>
        )}
      </div>
      <p className="font-mono text-[10px] tracking-[0.1em] text-ce-muted">
        {page} / {capped}
      </p>
      <div>
        {page < capped && (
          <Link
            href={pageHref(page + 1)}
            className="font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
          >
            {nextLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
