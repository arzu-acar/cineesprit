import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { NavBar } from "@components/NavBar";
import { HeroFeatured } from "@components/HeroFeatured";
import { FilmStrip } from "@components/FilmStrip";
import { FestivalCard } from "@components/FestivalCard";
import { SectionTitle } from "@components/ui/SectionTitle";
import { Link } from "@/i18n/navigation";
import { getFeaturedFilms, getFilmsByCategory } from "@lib/tmdb/client";
import { getUpcomingFestivals } from "@lib/supabase/festivals";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cineesprit.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}`,
      locale: locale === "en" ? "en_US" : "tr_TR",
    },
  };
}

export default async function HomePage() {
  const [locale, tHome] = await Promise.all([
    getLocale(),
    getTranslations("home"),
  ]);

  const [featuredFilms, auteurFilms, independentFilms, festivals] =
    await Promise.all([
      getFeaturedFilms(1, locale),
      getFilmsByCategory("auteur", 1, locale),
      getFilmsByCategory("bagimsiz", 1, locale),
      getUpcomingFestivals(4),
    ]);

  const heroFilm = featuredFilms.find((f) => f.backdrop_path) ?? featuredFilms[0];

  return (
    <>
      <NavBar />

      <main>
        {heroFilm ? (
          <HeroFeatured
            film={heroFilm}
            editorPick={tHome("editorPick")}
            goToFilm={tHome("goToFilm")}
          />
        ) : null}

        <div className="mx-auto max-w-7xl px-4 py-16 space-y-20 sm:px-6">
          <FilmStrip
            title={tHome("thisWeek")}
            films={featuredFilms.slice(1, 11)}
            index="01"
            seeAllHref={`/${locale}/films`}
            seeAllLabel={tHome("seeAll")}
          />

          <FilmStrip
            title={tHome("auteur")}
            films={auteurFilms.slice(0, 10)}
            category="auteur"
            index="02"
            seeAllHref={`/${locale}/films?category=auteur`}
            seeAllLabel={tHome("seeAll")}
          />

          <FilmStrip
            title={tHome("independent")}
            films={independentFilms.slice(0, 10)}
            category="bagimsiz"
            index="03"
            seeAllHref={`/${locale}/films?category=bagimsiz`}
            seeAllLabel={tHome("seeAll")}
          />

          {festivals.length > 0 ? (
            <section>
              <SectionTitle
                title={tHome("upcomingFestivals")}
                index="04"
                action={{ label: tHome("seeCalendar"), href: `/${locale}/festivals` }}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {festivals.map((festival) => (
                  <FestivalCard key={festival.id} festival={festival} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <footer className="border-t border-ce-border mt-12">
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
