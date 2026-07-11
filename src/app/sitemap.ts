import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getFestivals } from "@lib/supabase/festivals";
import { fetchTMDB } from "@lib/tmdb/client";
import type { TMDBMovieSummary, TMDBPaginatedResponse } from "@lib/tmdb/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cineesprit.com";
const LOCALES = ["tr", "en"] as const;

// Arthouse/drama keşfi için TMDB sabit fallback parametreleri
const ARTHOUSE_DISCOVER_PARAMS = {
  sort_by: "vote_average.desc",
  "vote_count.gte": 500,
  with_genres: "18",
  without_genres: "28,35,16,10751,36,10749",
  "vote_average.gte": 7.0,
} as const;

async function getCuratedFilmIds(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return [];

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from("curated_films")
    .select("tmdb_id");

  if (error || !data?.length) return [];
  return data.map((row) => String(row.tmdb_id));
}

async function getArthouseFallbackIds(): Promise<string[]> {
  try {
    const pages = await Promise.all(
      [1, 2, 3].map((p) =>
        fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>("/discover/movie", {
          params: { ...ARTHOUSE_DISCOVER_PARAMS, page: p },
          revalidate: 86400,
        })
      )
    );
    const ids = pages
      .flatMap((d) => d.results)
      .slice(0, 50)
      .map((f) => String(f.id));
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [festivals, curatedIds] = await Promise.all([
    getFestivals({}).catch(() => []),
    getCuratedFilmIds(),
  ]);

  const filmIds =
    curatedIds.length > 0 ? curatedIds : await getArthouseFallbackIds();

  const staticPages = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/films", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/festivals", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/auth", priority: 0.4, changeFrequency: "monthly" as const },
  ];

  const localePrefix = (locale: string) => (locale === "en" ? "/en" : "");

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${localePrefix(locale)}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }))
  );

  const festivalEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    festivals.map((f) => ({
      url: `${BASE_URL}${localePrefix(locale)}/festivals/${f.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  const filmEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    filmIds.map((id) => ({
      url: `${BASE_URL}${localePrefix(locale)}/films/${id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...festivalEntries, ...filmEntries];
}
