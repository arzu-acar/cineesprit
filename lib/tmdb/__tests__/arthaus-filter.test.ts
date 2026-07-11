import { describe, it, expect } from "vitest";
import { scoreMovie, filterArthaus } from "../arthaus-filter";
import type { TMDBMovieSummary } from "../types";

function makeMovie(overrides: Partial<TMDBMovieSummary> = {}): TMDBMovieSummary {
  return {
    id: 1,
    title: "Test Film",
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "2023-01-01",
    vote_average: 7.5,
    vote_count: 200,
    popularity: 30,
    genre_ids: [18], // drama
    original_language: "fr",
    ...overrides,
  };
}

describe("scoreMovie", () => {
  it("returns null when popularity > 100", () => {
    expect(scoreMovie(makeMovie({ popularity: 150 }))).toBeNull();
  });

  it("returns null when popularity < 5 and vote_count < 50", () => {
    expect(scoreMovie(makeMovie({ popularity: 3, vote_count: 20 }))).toBeNull();
  });

  it("returns null for mainstream action+adventure+sci-fi pattern", () => {
    expect(
      scoreMovie(makeMovie({ genre_ids: [28, 12, 878], original_language: "fr" }))
    ).toBeNull();
  });

  it("returns null for action film without arthouse genre", () => {
    expect(
      scoreMovie(makeMovie({ genre_ids: [28, 53], original_language: "en" }))
    ).toBeNull();
  });

  it("gives +30 for arthouse language", () => {
    const score = scoreMovie(makeMovie({ original_language: "fr", genre_ids: [18], vote_average: 6 }));
    expect(score).toBe(40); // 30 (lang) + 10 (1 genre match)
  });

  it("gives +20 for 2+ arthouse genres", () => {
    const score = scoreMovie(makeMovie({ genre_ids: [18, 99], original_language: "en", vote_average: 6 }));
    expect(score).toBe(20);
  });

  it("gives +20 for vote_average >= 7.5", () => {
    const score = scoreMovie(
      makeMovie({ vote_average: 7.5, original_language: "en", genre_ids: [18] })
    );
    expect(score).toBe(30); // 10 (genre) + 20 (vote)
  });

  it("gives +10 for vote_average >= 7.0", () => {
    const score = scoreMovie(
      makeMovie({ vote_average: 7.0, original_language: "en", genre_ids: [18] })
    );
    expect(score).toBe(20); // 10 (genre) + 10 (vote)
  });

  it("returns 0 for English film with no arthouse signals", () => {
    const score = scoreMovie(
      makeMovie({ original_language: "en", genre_ids: [], vote_average: 6 })
    );
    expect(score).toBe(0);
  });
});

describe("filterArthaus", () => {
  it("filters out movies below threshold", () => {
    const low = makeMovie({ original_language: "en", genre_ids: [18], vote_average: 6 });
    // score = 10; en threshold = 40 → filtered out
    const result = filterArthaus([low]);
    expect(result).toHaveLength(0);
  });

  it("keeps movies meeting threshold for non-English", () => {
    const arthouse = makeMovie({ original_language: "fr", genre_ids: [18], vote_average: 7.5 });
    // score = 30+10+20=60; non-en threshold = 20 → kept
    const result = filterArthaus([arthouse]);
    expect(result).toHaveLength(1);
  });

  it("sorts by date descending when sortByDate=true", () => {
    const older = makeMovie({ id: 1, release_date: "2020-01-01", original_language: "fr", genre_ids: [18], vote_average: 7.5 });
    const newer = makeMovie({ id: 2, release_date: "2023-01-01", original_language: "fr", genre_ids: [18], vote_average: 7.5 });
    const result = filterArthaus([older, newer], true);
    expect(result[0].id).toBe(2);
  });

  it("respects custom enThreshold", () => {
    const movie = makeMovie({ original_language: "en", genre_ids: [18], vote_average: 6 });
    // score = 10; with enThreshold=5 → kept
    const result = filterArthaus([movie], false, 5);
    expect(result).toHaveLength(1);
  });
});
