import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { NavBar } from "@components/NavBar";
import { FilmStrip } from "@components/FilmStrip";
import { SectionTitle } from "@components/ui/SectionTitle";
import { getUserProfile, getWatchHistory, getFavorites } from "@lib/supabase/profile";
import { getFilmDetails, tmdbImageUrl } from "@lib/tmdb/client";
import { getRecommendations } from "@lib/recommendations";
import type { TMDBMovieDetail } from "@lib/tmdb/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.profile" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("profile")]);

  const profile = await getUserProfile();
  if (!profile) redirect(`/${locale}/auth`);

  const [watchHistory, favorites] = await Promise.all([
    getWatchHistory(profile.id),
    getFavorites(profile.id),
  ]);

  const allFilmIds = [
    ...new Set([
      ...watchHistory.map((e) => e.film_id),
      ...favorites.map((e) => e.film_id),
    ]),
  ];

  const filmDetails = await Promise.all(
    allFilmIds.map((id) => getFilmDetails(id, locale).catch(() => null))
  );

  const filmMap = new Map<number, TMDBMovieDetail>(
    filmDetails
      .filter((f): f is TMDBMovieDetail => f !== null)
      .map((f) => [f.id, f])
  );

  const genreIdsByFilm: Record<number, number[]> = {};
  for (const [id, film] of filmMap) {
    genreIdsByFilm[id] = film.genres?.map((g) => g.id) ?? film.genre_ids ?? [];
  }

  const historyFilmIds = watchHistory.map((e) => e.film_id);
  const recommendations = historyFilmIds.length > 0
    ? await getRecommendations(historyFilmIds, genreIdsByFilm)
    : [];

  const watchedFilms = watchHistory
    .map((e) => filmMap.get(e.film_id))
    .filter((f): f is TMDBMovieDetail => f !== undefined);

  const favoriteFilms = favorites
    .map((e) => filmMap.get(e.film_id))
    .filter((f): f is TMDBMovieDetail => f !== undefined);

  return (
    <>
      <NavBar />

      <main className="px-10 py-12">
        <section className="mb-14 border-b border-ce-border pb-10">
          <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-ce-accent uppercase">
            {t("title")}
          </p>
          <h1 className="mb-1 font-serif text-[36px] italic text-ce-text">
            {profile.email?.split("@")[0]}
          </h1>
          <p className="font-mono text-[11px] tracking-[0.1em] text-ce-muted">
            {profile.email} · {t("member")} {formatDate(profile.created_at, locale)}
          </p>

          <div className="mt-8 flex gap-10">
            <Stat label={t("watched")} value={watchHistory.length} />
            <div className="w-px bg-ce-border" />
            <Stat label={t("favorites")} value={favorites.length} />
          </div>
        </section>

        <section className="mb-16">
          <SectionTitle
            title={t("watchHistory")}
            index="01"
            meta={watchHistory.length > 0 ? `${watchHistory.length} ${t("film")}` : undefined}
          />
          {watchedFilms.length === 0 ? (
            <EmptyState
              icon="○"
              message={t("noWatched")}
              sub={t("noWatchedSub")}
              cta={{ label: t("browseCatalog"), href: `/${locale}/films` }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {watchHistory.map((entry) => {
                const film = filmMap.get(entry.film_id);
                if (!film) return null;
                return (
                  <HistoryRow key={entry.id} film={film} date={entry.watched_at} locale={locale} />
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-16">
          <SectionTitle
            title={t("favoriteFilms")}
            index="02"
            meta={favorites.length > 0 ? `${favorites.length} ${t("film")}` : undefined}
          />
          {favoriteFilms.length === 0 ? (
            <EmptyState
              icon="♡"
              message={t("noFavorites")}
              sub={t("noFavoritesSub")}
              cta={{ label: t("discoverFilms"), href: `/${locale}/films` }}
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
              {favoriteFilms.map((film) => (
                <FavoriteCard key={film.id} film={film} locale={locale} noPoster={t("noPoster")} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <SectionTitle
            title={t("recommendations")}
            index="03"
            action={{ label: t("allCatalog"), href: `/${locale}/films` }}
          />
          {recommendations.length === 0 ? (
            <EmptyState
              icon="✦"
              message={t("noRecommendations")}
              sub={t("noRecommendationsSub")}
              cta={{ label: t("browseCatalog"), href: `/${locale}/films` }}
            />
          ) : (
            <FilmStrip title="" films={recommendations} />
          )}
        </section>

        <div className="border-t border-ce-border pt-8">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-ce-border mt-8">
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[60px]">
      <p className="font-serif text-[36px] italic leading-none text-ce-text">{value}</p>
      <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase">{label}</p>
    </div>
  );
}

function EmptyState({
  icon,
  message,
  sub,
  cta,
}: {
  icon: string;
  message: string;
  sub: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 border border-ce-border bg-[#0d0d0d] px-8 py-12 text-center">
      <span className="text-[28px] text-ce-border" aria-hidden="true">{icon}</span>
      <p className="font-serif italic text-[18px] text-ce-text-secondary">{message}</p>
      <p className="font-mono text-[11px] tracking-[0.08em] text-[#555]">{sub}</p>
      <Link
        href={cta.href}
        className="mt-2 font-mono text-[10px] tracking-[0.16em] text-ce-accent uppercase hover:opacity-75 transition-opacity"
      >
        {cta.label} →
      </Link>
    </div>
  );
}

function HistoryRow({ film, date, locale }: { film: TMDBMovieDetail; date: string; locale: string }) {
  const posterUrl = tmdbImageUrl(film.poster_path, "w500");
  const year = film.release_date?.slice(0, 4);
  const watchedAt = new Date(date).toLocaleDateString(locale === "en" ? "en-GB" : "tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/${locale}/films/${film.id}`}
      className="group flex items-center gap-4 border border-ce-border bg-ce-panel p-3 transition-colors hover:border-[#3a3a3a]"
    >
      <div className="relative h-[60px] w-[40px] shrink-0 overflow-hidden border border-ce-border bg-ce-bg">
        {posterUrl ? (
          <Image src={posterUrl} alt={film.title} fill sizes="40px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-ce-panel" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-[15px] italic leading-snug text-ce-text group-hover:text-ce-accent transition-colors">
          {film.title}
        </h3>
        {year && (
          <p className="font-mono text-[10px] tracking-[0.1em] text-ce-muted">{year}</p>
        )}
      </div>
      <p className="shrink-0 font-mono text-[10px] tracking-[0.06em] text-ce-muted">
        {watchedAt}
      </p>
    </Link>
  );
}

function FavoriteCard({ film, locale, noPoster }: { film: TMDBMovieDetail; locale: string; noPoster: string }) {
  const posterUrl = tmdbImageUrl(film.poster_path, "w500");

  return (
    <Link href={`/${locale}/films/${film.id}`} className="group w-[140px] shrink-0">
      <div className="relative mb-3 aspect-[2/3] w-[140px] overflow-hidden border border-ce-border bg-ce-panel">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={film.title}
            fill
            sizes="140px"
            className="object-cover transition-opacity group-hover:opacity-80"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-[9px] text-ce-muted">{noPoster}</span>
          </div>
        )}
      </div>
      <h3 className="font-serif text-[13px] italic leading-[1.3] text-ce-text group-hover:text-ce-accent transition-colors line-clamp-2">
        {film.title}
      </h3>
      {film.release_date && (
        <p className="mt-1 font-mono text-[10px] text-ce-muted">{film.release_date.slice(0, 4)}</p>
      )}
    </Link>
  );
}
