import { cache } from "react";
import type {
  FilmCategory,
  TMDBCredits,
  TMDBMovieDetail,
  TMDBMovieSummary,
  TMDBPaginatedResponse,
  TMDBVideo,
} from "./types";
import { filterArthaus, filterArthausNowPlaying } from "./arthaus-filter";

export type { FilmCategory, TMDBCredits, TMDBMovieDetail, TMDBMovieSummary, TMDBVideo } from "./types";

type FetchTMDBOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  revalidate?: number | false;
  language?: string;
};

export function tmdbLanguage(locale: string): string {
  return locale === "en" ? "en-US" : "tr-TR";
}

const CATEGORY_DISCOVER_PARAMS: Record<
  FilmCategory,
  Record<string, string | number>
> = {
  auteur: {
    sort_by: "primary_release_date.desc",
    "vote_count.gte": 100,
    with_genres: "18",
  },
  bagimsiz: {
    // Bağımsız drama: aksiyon/komedi/aile/animasyon dışı, yeni tarihli
    with_genres: "18",
    without_genres: "28,35,16,10751",
    sort_by: "primary_release_date.desc",
    "vote_count.gte": 10,
  },
  deneysel: {
    // Belgesel, tarih, müzik, gizem: aksiyon/animasyon/aile dışı
    with_genres: "99,36,9648,10402",
    without_genres: "28,16,10751",
    sort_by: "primary_release_date.desc",
    "vote_count.gte": 10,
  },
};

function getTMDBEnv() {
  const apiKey = process.env.TMDB_API_KEY;
  const baseUrl = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";

  if (!apiKey) {
    throw new Error("Missing TMDB environment variable: TMDB_API_KEY is required");
  }

  return { apiKey, baseUrl };
}

export function normalizeFilmCategory(category: string): FilmCategory | null {
  const normalized = category
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized === "auteur") return "auteur";
  if (normalized === "bagimsiz") return "bagimsiz";
  if (normalized === "deneysel") return "deneysel";

  return null;
}

export async function fetchTMDB<T>(
  path: string,
  options: FetchTMDBOptions = {}
): Promise<T> {
  const { apiKey, baseUrl } = getTMDBEnv();
  const { params = {}, revalidate = 3600, language = "tr-TR" } = options;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", language);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    next:
      revalidate === false
        ? { revalidate: 0 }
        : { revalidate, tags: [`tmdb:${normalizedPath}`] },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `TMDB request failed (${response.status} ${response.statusText}): ${normalizedPath}${body ? ` — ${body}` : ""}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getFeaturedFilms(page = 1, locale = "tr"): Promise<TMDBMovieSummary[]> {
  const lang = tmdbLanguage(locale);
  const pages = await Promise.all([1, 2, 3, 4, 5].map((p) =>
    fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>(
      "/movie/now_playing",
      { params: { page: p, region: "TR" }, revalidate: 3600, language: lang }
    )
  ));

  const all = pages.flatMap((d) => d.results);
  const filtered = filterArthausNowPlaying(all);
  const start = (page - 1) * 20;
  return filtered.slice(start, start + 20);
}

export async function getFilmsByCategory(
  category: string,
  page = 1,
  locale = "tr"
): Promise<TMDBMovieSummary[]> {
  const lang = tmdbLanguage(locale);
  const normalizedCategory = normalizeFilmCategory(category);

  if (!normalizedCategory) {
    throw new Error(
      `Unknown film category: "${category}". Expected auteur, bagimsiz, or deneysel.`
    );
  }

  const pages = await Promise.all([1, 2, 3].map((p) =>
    fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>(
      "/discover/movie",
      {
        params: { page: p, region: "TR", ...CATEGORY_DISCOVER_PARAMS[normalizedCategory] },
        revalidate: 3600,
        language: lang,
      }
    )
  ));

  const seenIds = new Set<number>();
  const seenTitles = new Set<string>();
  const all = pages.flatMap((d) => d.results).filter((m) => {
    const key = `${m.title.toLowerCase().trim()}|${m.release_date?.slice(0, 4)}`;
    if (seenIds.has(m.id) || seenTitles.has(key)) return false;
    seenIds.add(m.id);
    seenTitles.add(key);
    return true;
  });
  const filtered = filterArthaus(all, true);
  const start = (page - 1) * 20;
  return filtered.slice(start, start + 20);
}

export async function getFilmDetail(
  tmdbId: number | string
): Promise<TMDBMovieDetail> {
  return fetchTMDB<TMDBMovieDetail>(`/movie/${tmdbId}`);
}

export async function searchFilms(
  query: string,
  page = 1
): Promise<TMDBMovieSummary[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const data = await fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>(
    "/search/movie",
    {
      params: {
        query: trimmedQuery,
        page,
        include_adult: false,
      },
    }
  );

  return data.results;
}

export type DiscoverFilmsOptions = {
  query?: string;
  genreId?: string;
  year?: string;
  language?: string;
  page?: number;
  locale?: string;
};

export async function discoverFilms(
  options: DiscoverFilmsOptions = {}
): Promise<{ results: TMDBMovieSummary[]; totalPages: number }> {
  const { query, genreId, year, language, page = 1, locale = "tr" } = options;
  const lang = tmdbLanguage(locale);

  if (query && query.trim()) {
    const pages = await Promise.all([1, 2, 3].map((p) =>
      fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>(
        "/search/movie",
        {
          params: { query: query.trim(), page: p, include_adult: false },
          revalidate: 300,
          language: lang,
        }
      )
    ));
    const all = pages.flatMap((d) => d.results);
    const filtered = filterArthaus(all, true);
    const start = (page - 1) * 20;
    return { results: filtered.slice(start, start + 20), totalPages: Math.ceil(filtered.length / 20) };
  }

  const pages = await Promise.all([1, 2, 3].map((p) =>
    fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>(
      "/discover/movie",
      {
        params: {
          sort_by: "primary_release_date.desc",
          "vote_count.gte": 50,
          region: "TR",
          with_genres: genreId || undefined,
          primary_release_year: year || undefined,
          with_original_language: language || undefined,
          page: p,
        },
        revalidate: 3600,
        language: lang,
      }
    )
  ));
  const all = pages.flatMap((d) => d.results);
  const filtered = filterArthaus(all, true);
  const start = (page - 1) * 20;
  return { results: filtered.slice(start, start + 20), totalPages: Math.ceil(filtered.length / 20) };
}

// React.cache ile aynı request içinde tekrarlanan çağrılar deduplicate edilir
export const getFilmDetails = cache(async (
  tmdbId: number | string,
  locale = "tr"
): Promise<TMDBMovieDetail> => {
  return fetchTMDB<TMDBMovieDetail>(`/movie/${tmdbId}`, {
    params: { append_to_response: "credits,videos" },
    revalidate: 86400,
    language: tmdbLanguage(locale),
  });
});

export async function getSimilarFilms(
  tmdbId: number | string,
  locale = "tr"
): Promise<TMDBMovieSummary[]> {
  const lang = tmdbLanguage(locale);
  const [p1, p2] = await Promise.all([
    fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>(
      `/movie/${tmdbId}/similar`,
      { params: { page: 1 }, revalidate: 86400, language: lang }
    ),
    fetchTMDB<TMDBPaginatedResponse<TMDBMovieSummary>>(
      `/movie/${tmdbId}/similar`,
      { params: { page: 2 }, revalidate: 86400, language: lang }
    ),
  ]);
  const seen = new Set<number>();
  const all = [...p1.results, ...p2.results].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
  return filterArthaus(all, true).slice(0, 10);
}

export function getTrailerKey(videos: TMDBVideo[]): string | null {
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");
  return trailer?.key ?? null;
}

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w92" | "w500" | "w780" | "original" = "w500"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
