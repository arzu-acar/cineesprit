import { FilmCard } from "@components/ui/FilmCard";
import { SectionTitle } from "@components/ui/SectionTitle";
import type { TMDBMovieSummary } from "@lib/tmdb/types";
import type { FilmCategory } from "@lib/tmdb/types";

type FilmStripProps = {
  title: string;
  films: TMDBMovieSummary[];
  category?: FilmCategory;
  seeAllHref?: string;
  seeAllLabel?: string;
  index?: string;
};

export function FilmStrip({
  title,
  films,
  category,
  seeAllHref,
  seeAllLabel = "See All →",
  index,
}: FilmStripProps) {
  if (films.length === 0) return null;

  return (
    <section>
      <SectionTitle
        title={title}
        index={index}
        action={seeAllHref ? { label: seeAllLabel, href: seeAllHref } : undefined}
      />
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
        {films.map((film, i) => (
          <div key={film.id} className="w-[180px] shrink-0 md:w-[200px]">
            <FilmCard
              id={film.id}
              title={film.title}
              posterPath={film.poster_path}
              year={film.release_date ? Number(film.release_date.slice(0, 4)) : undefined}
              category={category}
              listName={title}
              position={i + 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
