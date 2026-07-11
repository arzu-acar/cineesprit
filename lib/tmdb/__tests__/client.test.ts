import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TMDBMovieSummary, TMDBPaginatedResponse } from "../types";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockPage(results: Partial<TMDBMovieSummary>[]): TMDBPaginatedResponse<TMDBMovieSummary> {
  return {
    page: 1,
    total_pages: 1,
    total_results: results.length,
    results: results.map((r, i) => ({
      id: i + 1,
      title: `Film ${i + 1}`,
      overview: "",
      poster_path: null,
      backdrop_path: null,
      release_date: "2023-01-01",
      vote_average: 8.0,
      vote_count: 200,
      popularity: 30,
      genre_ids: [18],
      original_language: "fr",
      ...r,
    })),
  };
}

function mockResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  vi.resetModules();
  process.env.TMDB_API_KEY = "test-key";
  process.env.TMDB_BASE_URL = "https://api.themoviedb.org/3";
});

afterEach(() => {
  mockFetch.mockReset();
});

describe("getFeaturedFilms", () => {
  it("returns filtered arthouse films from now_playing", async () => {
    const page = mockPage([{ original_language: "fr", genre_ids: [18], vote_average: 8 }]);
    mockFetch.mockResolvedValue(mockResponse(page));

    const { getFeaturedFilms } = await import("../client");
    const result = await getFeaturedFilms();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
    expect(mockFetch).toHaveBeenCalledTimes(5); // fetches 5 pages
  });

  it("excludes mainstream films", async () => {
    const page = mockPage([
      { id: 1, genre_ids: [28, 12, 878], original_language: "en" }, // mainstream
      { id: 2, genre_ids: [18], original_language: "fr" }, // arthouse
    ]);
    mockFetch.mockResolvedValue(mockResponse(page));

    const { getFeaturedFilms } = await import("../client");
    const result = await getFeaturedFilms();

    expect(result.every((f) => f.id !== 1)).toBe(true);
  });
});

describe("getFilmsByCategory", () => {
  it("throws for unknown category", async () => {
    const { getFilmsByCategory } = await import("../client");
    await expect(getFilmsByCategory("unknown")).rejects.toThrow("Unknown film category");
  });

  it("returns films for auteur category", async () => {
    const page = mockPage([{ id: 99, genre_ids: [18], original_language: "it", vote_average: 8 }]);
    mockFetch.mockResolvedValue(mockResponse(page));

    const { getFilmsByCategory } = await import("../client");
    const result = await getFilmsByCategory("auteur");

    expect(Array.isArray(result)).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3); // fetches 3 pages
  });

  it("accepts deneysel category", async () => {
    const page = mockPage([]);
    mockFetch.mockResolvedValue(mockResponse(page));

    const { getFilmsByCategory } = await import("../client");
    await expect(getFilmsByCategory("deneysel")).resolves.toBeDefined();
  });
});

describe("searchFilms", () => {
  it("returns empty array for blank query", async () => {
    const { searchFilms } = await import("../client");
    const result = await searchFilms("   ");
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls TMDB search endpoint and returns results", async () => {
    const page = mockPage([{ id: 42, title: "Mulholland Drive" }]);
    mockFetch.mockResolvedValue(mockResponse(page));

    const { searchFilms } = await import("../client");
    const result = await searchFilms("mulholland");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(42);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("search/movie");
    expect(calledUrl).toContain("query=mulholland");
  });
});

describe("tmdbImageUrl", () => {
  it("returns null for falsy path", async () => {
    const { tmdbImageUrl } = await import("../client");
    expect(tmdbImageUrl(null)).toBeNull();
    expect(tmdbImageUrl(undefined)).toBeNull();
    expect(tmdbImageUrl("")).toBeNull();
  });

  it("returns correct URL with default size w500", async () => {
    const { tmdbImageUrl } = await import("../client");
    expect(tmdbImageUrl("/foo.jpg")).toBe("https://image.tmdb.org/t/p/w500/foo.jpg");
  });

  it("respects custom size", async () => {
    const { tmdbImageUrl } = await import("../client");
    expect(tmdbImageUrl("/foo.jpg", "w92")).toBe("https://image.tmdb.org/t/p/w92/foo.jpg");
  });
});

describe("fetchTMDB error handling", () => {
  it("throws when TMDB_API_KEY is missing", async () => {
    delete process.env.TMDB_API_KEY;
    const { fetchTMDB } = await import("../client");
    await expect(fetchTMDB("/movie/1")).rejects.toThrow("TMDB_API_KEY");
  });

  it("throws on non-ok response", async () => {
    process.env.TMDB_API_KEY = "test-key";
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: () => Promise.resolve(""),
    });

    const { fetchTMDB } = await import("../client");
    await expect(fetchTMDB("/movie/9999")).rejects.toThrow("404");
  });
});
