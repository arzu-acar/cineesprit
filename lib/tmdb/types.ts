export type FilmCategory = "auteur" | "bagimsiz" | "deneysel";

export interface TMDBMovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  original_language?: string;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBMovieDetail extends TMDBMovieSummary {
  runtime: number | null;
  genres: TMDBGenre[];
  status: string;
  tagline: string | null;
  production_countries?: { iso_3166_1: string; name: string }[];
  credits?: TMDBCredits;
  videos?: { results: TMDBVideo[] };
}
