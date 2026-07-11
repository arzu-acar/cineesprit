import { discoverFilms } from "./tmdb/client";
import type { TMDBMovieSummary } from "./tmdb/client";

// TMDB genre_ids returned on summary objects → pick the dominant one
export async function getRecommendations(
  filmIds: number[],
  genreIdsByFilm: Record<number, number[]>,
  limit = 10
): Promise<TMDBMovieSummary[]> {
  if (filmIds.length === 0) return [];

  const freq: Record<number, number> = {};
  for (const filmId of filmIds) {
    for (const gid of genreIdsByFilm[filmId] ?? []) {
      freq[gid] = (freq[gid] ?? 0) + 1;
    }
  }

  const topGenre = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!topGenre) return [];

  const { results } = await discoverFilms({
    genreId: topGenre,
    page: 1,
  });

  // Exclude films already in history
  const seen = new Set(filmIds);
  return results.filter((f) => !seen.has(f.id)).slice(0, limit);
}
