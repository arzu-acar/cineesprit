import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>DRAMA</Badge>);
    expect(screen.getByText("DRAMA")).toBeInTheDocument();
  });

  it("renders nothing when no label or category", () => {
    const { container } = render(<Badge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders AUTEUR label for auteur category", () => {
    render(<Badge category="auteur" />);
    expect(screen.getByText("AUTEUR")).toBeInTheDocument();
  });

  it("renders BAĞIMSIZ label for bagimsiz category", () => {
    render(<Badge category="bagimsiz" />);
    expect(screen.getByText("BAĞIMSIZ")).toBeInTheDocument();
  });

  it("renders DENEYSEL label for deneysel category", () => {
    render(<Badge category="deneysel" />);
    expect(screen.getByText("DENEYSEL")).toBeInTheDocument();
  });

  it("applies accent variant styles for auteur category", () => {
    render(<Badge category="auteur" />);
    const badge = screen.getByText("AUTEUR");
    expect(badge.className).toContain("border-ce-accent");
    expect(badge.className).toContain("text-ce-accent");
  });

  it("applies neutral variant styles for bagimsiz category", () => {
    render(<Badge category="bagimsiz" />);
    const badge = screen.getByText("BAĞIMSIZ");
    expect(badge.className).toContain("border-[#3a3a3a]");
  });

  it("applies filled variant when explicitly set", () => {
    render(<Badge variant="filled">ÖZEL</Badge>);
    const badge = screen.getByText("ÖZEL");
    expect(badge.className).toContain("bg-ce-accent");
  });

  it("applies muted variant when explicitly set", () => {
    render(<Badge variant="muted">MUTED</Badge>);
    const badge = screen.getByText("MUTED");
    expect(badge.className).toContain("text-ce-muted");
  });

  it("children override category label", () => {
    render(<Badge category="auteur">CUSTOM</Badge>);
    expect(screen.getByText("CUSTOM")).toBeInTheDocument();
    expect(screen.queryByText("AUTEUR")).not.toBeInTheDocument();
  });

  it("appends custom className", () => {
    render(<Badge className="extra-class">TAG</Badge>);
    expect(screen.getByText("TAG").className).toContain("extra-class");
  });

  it("renders nothing for unknown category", () => {
    const { container } = render(<Badge category="unknown-cat" />);
    expect(container.firstChild).toBeNull();
  });
});
