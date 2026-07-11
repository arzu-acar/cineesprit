import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPushProductImpression = vi.fn();
const mockPushProductClick = vi.fn();

vi.mock("@hooks/useDataLayer", () => ({
  useDataLayer: () => ({
    pushProductImpression: mockPushProductImpression,
    pushProductClick: mockPushProductClick,
    pushVirtualPageview: vi.fn(),
    pushGAEvent: vi.fn(),
  }),
}));

vi.mock("@hooks/useImpression", () => ({
  useImpression: (cb: () => void) => {
    cb();
    return { current: null };
  },
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, onClick, className }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@lib/tmdb/client", () => ({
  tmdbImageUrl: (path: string | null | undefined) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null,
}));

import { FilmCard } from "../FilmCard";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FilmCard — grid variant (default)", () => {
  it("renders film title", () => {
    render(<FilmCard id={1} title="Mulholland Drive" />);
    expect(screen.getByText("Mulholland Drive")).toBeInTheDocument();
  });

  it("links to /films/:id by default", () => {
    render(<FilmCard id={99} title="Lost Highway" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/films/99");
  });

  it("uses custom href when provided", () => {
    render(<FilmCard id={1} title="Blue Velvet" href="/custom/path" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/custom/path");
  });

  it("renders poster image when posterPath is provided", () => {
    render(<FilmCard id={1} title="Eraserhead" posterPath="/poster.jpg" />);
    const img = screen.getByRole("img", { name: "Eraserhead" });
    expect(img).toHaveAttribute("src", "https://image.tmdb.org/t/p/w500/poster.jpg");
  });

  it("does not render img when posterPath is null", () => {
    render(<FilmCard id={1} title="No Poster" posterPath={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders year in meta", () => {
    render(<FilmCard id={1} title="Test" year={2001} />);
    expect(screen.getByText(/2001/)).toBeInTheDocument();
  });

  it("renders country in meta (uppercased)", () => {
    render(<FilmCard id={1} title="Test" country="fr" />);
    expect(screen.getByText(/FR/)).toBeInTheDocument();
  });

  it("renders runtime in meta", () => {
    render(<FilmCard id={1} title="Test" runtime={147} />);
    expect(screen.getByText(/147 DK/)).toBeInTheDocument();
  });

  it("does not render meta section when no year/country/runtime", () => {
    const { container } = render(<FilmCard id={1} title="Test" />);
    expect(container.querySelector(".font-mono")).toBeNull();
  });

  it("calls pushProductClick on link click", async () => {
    const user = userEvent.setup();
    render(<FilmCard id={1} title="Click Me" listName="featured" position={3} />);
    await user.click(screen.getByRole("link"));
    expect(mockPushProductClick).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: "Click Me", position: 3 })]),
      "Click Me"
    );
  });

  it("calls pushProductImpression on mount", () => {
    render(<FilmCard id={1} title="Impression Film" />);
    expect(mockPushProductImpression).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: "Impression Film" })]),
      "Impression Film"
    );
  });
});

describe("FilmCard — panel variant", () => {
  it("renders as article element", () => {
    const { container } = render(<FilmCard id={1} title="Panel Film" variant="panel" />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("renders overview when provided", () => {
    render(
      <FilmCard id={1} title="Panel Film" variant="panel" overview="A dark mystery unfolds." />
    );
    expect(screen.getByText("A dark mystery unfolds.")).toBeInTheDocument();
  });

  it("renders 'Dosyaya ekle' CTA", () => {
    render(<FilmCard id={1} title="Panel Film" variant="panel" />);
    expect(screen.getByText("Dosyaya ekle")).toBeInTheDocument();
  });

  it("does not render overview section when omitted", () => {
    render(<FilmCard id={1} title="No Overview" variant="panel" />);
    expect(screen.queryByText(/A dark/)).not.toBeInTheDocument();
  });
});
