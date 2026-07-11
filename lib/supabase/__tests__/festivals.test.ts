import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("../server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(mockSupabase),
}));

function buildQueryChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select", "eq", "gte", "gt", "lte", "lt", "ilike",
    "order", "limit", "maybeSingle",
  ];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  // Terminal: awaiting the chain returns result
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getFestivals", () => {
  it("returns festivals on success", async () => {
    const festivals = [{ id: "1", name: "Cannes", country: "France" }];
    mockFrom.mockReturnValue(buildQueryChain({ data: festivals, error: null }));

    const { getFestivals } = await import("../festivals");
    const result = await getFestivals();

    expect(result).toEqual(festivals);
    expect(mockFrom).toHaveBeenCalledWith("festivals");
  });

  it("returns empty array on error", async () => {
    mockFrom.mockReturnValue(buildQueryChain({ data: null, error: { message: "DB error" } }));

    const { getFestivals } = await import("../festivals");
    const result = await getFestivals();

    expect(result).toEqual([]);
  });

  it("applies upcoming status filter", async () => {
    const chain = buildQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { getFestivals } = await import("../festivals");
    await getFestivals({ status: "upcoming" });

    expect((chain.gt as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("start_date", expect.any(String));
  });

  it("applies ongoing status filter", async () => {
    const chain = buildQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { getFestivals } = await import("../festivals");
    await getFestivals({ status: "ongoing" });

    expect((chain.lte as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("start_date", expect.any(String));
    expect((chain.gte as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("end_date", expect.any(String));
  });

  it("applies country filter with ilike", async () => {
    const chain = buildQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { getFestivals } = await import("../festivals");
    await getFestivals({ country: "France" });

    expect((chain.ilike as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith("country", "France");
  });
});

describe("getFestivalById", () => {
  it("returns festival when found", async () => {
    const festival = { id: "42", name: "Venice", country: "Italy" };
    mockFrom.mockReturnValue(buildQueryChain({ data: festival, error: null }));

    const { getFestivalById } = await import("../festivals");
    const result = await getFestivalById("42");

    expect(result).toEqual(festival);
  });

  it("returns null when not found", async () => {
    mockFrom.mockReturnValue(buildQueryChain({ data: null, error: null }));

    const { getFestivalById } = await import("../festivals");
    const result = await getFestivalById("999");

    expect(result).toBeNull();
  });

  it("returns null on error", async () => {
    mockFrom.mockReturnValue(buildQueryChain({ data: null, error: { message: "not found" } }));

    const { getFestivalById } = await import("../festivals");
    const result = await getFestivalById("bad-id");

    expect(result).toBeNull();
  });
});
