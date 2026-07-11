import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { tmdbImageUrl } from "@lib/tmdb/client";
import type { TMDBMovieSummary } from "@lib/tmdb/types";

type HeroFeaturedProps = {
  film: TMDBMovieSummary;
  editorPick: string;
  goToFilm: string;
};

export function HeroFeatured({ film, editorPick, goToFilm }: HeroFeaturedProps) {
  const backdropUrl = tmdbImageUrl(film.backdrop_path, "original");
  const year = film.release_date ? film.release_date.slice(0, 4) : null;

  return (
    <section className="relative h-[70vh] min-h-[480px] overflow-hidden border-b border-ce-border bg-ce-panel">
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={film.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-ce-bg via-ce-bg/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ce-bg/70 to-transparent" />

      <div className="relative flex h-full max-w-7xl flex-col justify-end px-6 pb-14 mx-auto">
        <div className="max-w-xl">
          <p className="mb-4 font-mono text-[10px] tracking-[0.2em] text-ce-accent uppercase">
            {editorPick}
          </p>

          {year ? (
            <p className="mb-3 font-mono text-[11px] tracking-[0.14em] text-ce-muted uppercase">
              {year}
            </p>
          ) : null}

          <h1 className="mb-5 font-serif text-[48px] font-normal italic leading-[1.08] text-ce-text md:text-[56px]">
            {film.title}
          </h1>

          {film.overview ? (
            <p className="mb-8 max-w-md text-[14px] leading-[1.7] text-ce-text-secondary line-clamp-3">
              {film.overview}
            </p>
          ) : null}

          <Link
            href={`/films/${film.id}`}
            className="inline-flex items-center gap-3 border border-ce-accent px-6 py-3 font-mono text-[11px] tracking-[0.14em] text-ce-accent uppercase transition-colors hover:bg-ce-accent hover:text-ce-bg"
          >
            {goToFilm}
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
