import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { NavBar } from "@components/NavBar";
import { FilmCard } from "@components/ui/FilmCard";
import { FilmActions } from "@components/FilmActions";
import { SectionTitle } from "@components/ui/SectionTitle";
import { getFilmDetails, getSimilarFilms, getTrailerKey, tmdbImageUrl } from "@lib/tmdb/client";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { isInWatchHistory, isInFavorites } from "@lib/supabase/interactions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cineesprit.com";

type PageProps = { params: Promise<{ id: string; locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const film = await getFilmDetails(id, locale);
    const posterUrl = film.poster_path
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
      : undefined;
    return {
      title: film.title,
      description: film.overview?.slice(0, 160) ?? undefined,
      openGraph: {
        title: `${film.title} — CineEsprit`,
        description: film.overview?.slice(0, 160) ?? undefined,
        url: `${BASE_URL}/${locale}/films/${id}`,
        images: posterUrl ? [{ url: posterUrl, width: 500, height: 750 }] : [],
        locale: locale === "en" ? "en_US" : "tr_TR",
      },
    };
  } catch {
    return { title: "Film — CineEsprit" };
  }
}

export default async function FilmDetailPage({ params }: PageProps) {
  const { id, locale } = await params;

  const [t, currentLocale] = await Promise.all([
    getTranslations("filmDetail"),
    getLocale(),
  ]);

  let film;
  try {
    film = await getFilmDetails(id, currentLocale);
  } catch {
    notFound();
  }

  const [similarFilms, supabase] = await Promise.all([
    getSimilarFilms(id, currentLocale),
    createSupabaseServerClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  const [watched, favorited] = user
    ? await Promise.all([
        isInWatchHistory(user.id, film.id),
        isInFavorites(user.id, film.id),
      ])
    : [false, false];

  const backdropUrl = tmdbImageUrl(film.backdrop_path, "original");
  const posterUrl = tmdbImageUrl(film.poster_path, "w500");
  const year = film.release_date?.slice(0, 4);
  const runtime = film.runtime
    ? `${Math.floor(film.runtime / 60)}s ${film.runtime % 60}d`
    : null;
  const countries = film.production_countries?.map((c) => c.name).join(", ");
  const director = film.credits?.crew.find((c) => c.job === "Director")?.name;
  const cast = film.credits?.cast.slice(0, 6) ?? [];
  const trailerKey = film.videos?.results
    ? getTrailerKey(film.videos.results)
    : null;

  return (
    <>
      <NavBar />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[360px] overflow-hidden border-b border-ce-border bg-ce-panel">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={film.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ce-bg via-ce-bg/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ce-bg/60 to-transparent" />
      </section>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6">
        {/* Poster + Info grid */}
        <div className="relative -mt-40 mb-16 grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr]">
          {/* Poster */}
          <div className="hidden md:block">
            <div className="relative aspect-[2/3] w-[260px] overflow-hidden border border-ce-border bg-ce-panel">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={film.title}
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-mono text-[10px] text-ce-muted uppercase">{t("noPoster")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="pt-0 md:pt-32">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              {year && (
                <span className="font-mono text-[11px] tracking-[0.14em] text-ce-muted">{year}</span>
              )}
              {runtime && (
                <span className="font-mono text-[11px] tracking-[0.14em] text-ce-muted">{runtime}</span>
              )}
              {countries && (
                <span className="font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase">{countries}</span>
              )}
            </div>

            <h1 className="mb-3 font-serif text-[42px] font-normal italic leading-[1.08] text-ce-text md:text-[52px]">
              {film.title}
            </h1>

            {film.tagline && (
              <p className="mb-5 font-mono text-[12px] tracking-[0.1em] text-ce-muted italic">
                "{film.tagline}"
              </p>
            )}

            {film.genres.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {film.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/${currentLocale}/films?genre=${g.id}`}
                    className="border border-ce-border px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-ce-muted uppercase hover:border-[#3a3a3a] hover:text-ce-text transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {film.overview && (
              <p className="mb-8 max-w-2xl text-[14px] leading-[1.75] text-ce-text-secondary">
                {film.overview}
              </p>
            )}

            <div className="mb-8">
              <FilmActions
                filmId={film.id}
                filmTitle={film.title}
                initialWatched={watched}
                initialFavorited={favorited}
                isLoggedIn={!!user}
              />
            </div>

            {trailerKey && (
              <a
                href={`https://www.youtube.com/watch?v=${trailerKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-ce-border px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase hover:border-[#3a3a3a] hover:text-ce-text transition-colors"
              >
                {t("trailer")}
              </a>
            )}
          </div>
        </div>

        {(director || cast.length > 0) && (
          <div className="mb-16 grid grid-cols-1 gap-8 border-t border-ce-border pt-10 sm:grid-cols-2">
            {director && (
              <div>
                <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-ce-muted uppercase">
                  {t("director")}
                </p>
                <p className="font-serif text-[20px] italic text-ce-text">{director}</p>
              </div>
            )}
            {cast.length > 0 && (
              <div>
                <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-ce-muted uppercase">
                  {t("cast")}
                </p>
                <ul className="space-y-1">
                  {cast.map((c) => (
                    <li key={c.id} className="text-[13px] text-ce-text-secondary">
                      <span className="text-ce-text">{c.name}</span>
                      {c.character && (
                        <span className="ml-2 font-mono text-[10px] text-ce-muted">
                          {c.character}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {similarFilms.length > 0 && (
          <section className="mb-20">
            <SectionTitle title={t("similar")} index="→" />
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {similarFilms.slice(0, 10).map((f) => (
                <FilmCard
                  key={f.id}
                  id={f.id}
                  title={f.title}
                  posterPath={f.poster_path}
                  year={f.release_date ? Number(f.release_date.slice(0, 4)) : undefined}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-ce-border">
        <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
          <span className="font-serif italic text-ce-text-secondary text-[15px]">CineEsprit</span>
          <p className="font-mono text-[10px] tracking-[0.1em] text-ce-muted uppercase">
            {currentLocale === "en" ? "Independent · Auteur · Experimental" : "Bağımsız · Auteur · Deneysel"}
          </p>
        </div>
      </footer>
    </>
  );
}
