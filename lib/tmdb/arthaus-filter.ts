import type { TMDBMovieSummary } from "./types";

const ARTHOUSE_LANGUAGES = [
  'fr', 'it', 'de', 'es', 'pt', 'ja', 'ko', 'zh', 'ru',
  'sv', 'da', 'pl', 'hu', 'cs', 'ro', 'fa', 'ar', 'hi',
  'th', 'tr', 'el',
];

const ARTHOUSE_GENRES = [18, 99, 36, 10752, 9648, 10402];
// drama, documentary, history, war, mystery, music

const MAINSTREAM_PATTERNS = [
  [28, 12, 878],   // action + adventure + sci-fi
  [28, 12, 14],    // action + adventure + fantasy
  [16, 12, 10751], // animation + adventure + family
  [16, 35, 10751], // animation + comedy + family
  [28, 35, 10751], // action + comedy + family
];

function isMainstreamPattern(genreIds: number[]): boolean {
  const genreSet = new Set(genreIds);
  return MAINSTREAM_PATTERNS.some((pattern) =>
    pattern.every((g) => genreSet.has(g))
  );
}

export function scoreMovie(movie: TMDBMovieSummary): number | null {
  const { popularity = 50, vote_count = 0, genre_ids, original_language, vote_average } = movie;

  if (popularity > 100) return null;
  if (popularity < 5 && vote_count < 50) return null;
  if (isMainstreamPattern(genre_ids ?? [])) return null;

  const genres = genre_ids ?? [];
  const hasArthougeGenre = genres.some((g) => ARTHOUSE_GENRES.includes(g));

  // Aksiyon filmleri arthouse türü olmadan geçemez
  if (genres.includes(28) && !hasArthougeGenre) return null;

  let score = 0;

  if (original_language && ARTHOUSE_LANGUAGES.includes(original_language)) score += 30;

  const arthouseGenreMatches = (genre_ids ?? []).filter((g) =>
    ARTHOUSE_GENRES.includes(g)
  ).length;
  if (arthouseGenreMatches >= 2) score += 20;
  else if (arthouseGenreMatches === 1) score += 10;

  if (vote_average >= 7.5) score += 20;
  else if (vote_average >= 7.0) score += 10;

  return score;
}

// Vizyondaki filmler için gevşek filtre: yeni filmler popüler olur,
// mainstream pattern ve aksiyon-only kontrolü yeterli
export function filterArthausNowPlaying(movies: TMDBMovieSummary[]): TMDBMovieSummary[] {
  return movies
    .filter((movie) => {
      const genres = movie.genre_ids ?? [];
      if (isMainstreamPattern(genres)) return false;
      const hasArthouseGenre = genres.some((g) => ARTHOUSE_GENRES.includes(g));
      if (genres.includes(28) && !hasArthouseGenre) return false;
      // En az bir arthouse türü veya non-İngilizce dil gerekli
      const isNonEnglish = movie.original_language !== 'en' && movie.original_language !== undefined;
      return hasArthouseGenre || isNonEnglish;
    })
    .sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''));
}

export function filterArthaus(
  movies: TMDBMovieSummary[],
  sortByDate = false,
  enThreshold = 40
): TMDBMovieSummary[] {
  const filtered = movies.filter((movie) => {
    const score = scoreMovie(movie);
    if (score === null) return false;
    const threshold = movie.original_language === 'en' ? enThreshold : 20;
    return score >= threshold;
  });

  if (sortByDate) {
    filtered.sort((a, b) =>
      (b.release_date ?? '').localeCompare(a.release_date ?? '')
    );
  }

  return filtered;
}
