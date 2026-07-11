import { describe, it, expect } from "vitest";
import { FestivalSchema, CurateFilmSchema, AuthSchema } from "../validations";

describe("FestivalSchema", () => {
  const valid = {
    name: "Cannes Film Festivali",
    country: "Fransa",
    location: "Cannes",
    start_date: "2024-05-14",
    end_date: "2024-05-25",
  };

  it("accepts valid input", () => {
    expect(FestivalSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty name", () => {
    const r = FestivalSchema.safeParse({ ...valid, name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid start_date format", () => {
    const r = FestivalSchema.safeParse({ ...valid, start_date: "14-05-2024" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid end_date format", () => {
    const r = FestivalSchema.safeParse({ ...valid, end_date: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("rejects cover_url not starting with https://", () => {
    const r = FestivalSchema.safeParse({ ...valid, cover_url: "http://example.com/img.jpg" });
    expect(r.success).toBe(false);
  });

  it("accepts cover_url starting with https://", () => {
    const r = FestivalSchema.safeParse({ ...valid, cover_url: "https://example.com/img.jpg" });
    expect(r.success).toBe(true);
  });

  it("accepts optional fields when omitted", () => {
    const r = FestivalSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("rejects description over 2000 chars", () => {
    const r = FestivalSchema.safeParse({ ...valid, description: "x".repeat(2001) });
    expect(r.success).toBe(false);
  });
});

describe("CurateFilmSchema", () => {
  it("accepts valid tmdb_id as string and transforms to number", () => {
    const r = CurateFilmSchema.safeParse({ tmdb_id: "12345" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.tmdb_id).toBe(12345);
  });

  it("rejects non-numeric tmdb_id", () => {
    const r = CurateFilmSchema.safeParse({ tmdb_id: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects tmdb_id with letters mixed in", () => {
    const r = CurateFilmSchema.safeParse({ tmdb_id: "123abc" });
    expect(r.success).toBe(false);
  });

  it("accepts optional curator_note and tags", () => {
    const r = CurateFilmSchema.safeParse({
      tmdb_id: "1",
      curator_note: "Muhteşem bir film",
      tags: "arthouse,drama",
      featured: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects curator_note over 1000 chars", () => {
    const r = CurateFilmSchema.safeParse({ tmdb_id: "1", curator_note: "x".repeat(1001) });
    expect(r.success).toBe(false);
  });
});

describe("AuthSchema", () => {
  it("accepts valid email and password", () => {
    const r = AuthSchema.safeParse({ email: "test@example.com", password: "Secret1!" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const r = AuthSchema.safeParse({ email: "not-an-email", password: "Secret1!" });
    expect(r.success).toBe(false);
  });

  it("rejects password shorter than 6 chars", () => {
    const r = AuthSchema.safeParse({ email: "test@example.com", password: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects password over 128 chars", () => {
    const r = AuthSchema.safeParse({ email: "test@example.com", password: "x".repeat(129) });
    expect(r.success).toBe(false);
  });

  it("rejects email over 254 chars", () => {
    const r = AuthSchema.safeParse({ email: `${"a".repeat(250)}@x.co`, password: "pass123" });
    expect(r.success).toBe(false);
  });
});
