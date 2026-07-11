import type { FilmCategory } from "@lib/tmdb/types";

type BadgeVariant = "accent" | "neutral" | "filled" | "muted";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  accent: "border-ce-accent text-ce-accent bg-ce-bg",
  neutral: "border-[#3a3a3a] text-[#c8c8c6] bg-ce-bg",
  filled: "border-ce-accent bg-ce-accent text-ce-bg",
  muted: "border-ce-border text-ce-muted bg-transparent",
};

const CATEGORY_VARIANT: Record<FilmCategory, BadgeVariant> = {
  auteur: "accent",
  bagimsiz: "neutral",
  deneysel: "neutral",
};

const CATEGORY_LABELS: Record<FilmCategory, string> = {
  auteur: "AUTEUR",
  bagimsiz: "BAĞIMSIZ",
  deneysel: "DENEYSEL",
};

type BadgeProps = {
  children?: string;
  category?: FilmCategory | string;
  variant?: BadgeVariant;
  className?: string;
};

function resolveVariant(
  variant: BadgeVariant | undefined,
  category: FilmCategory | string | undefined
): BadgeVariant {
  if (variant) return variant;

  if (category) {
    const normalized = category.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized === "auteur") return CATEGORY_VARIANT.auteur;
    if (normalized === "bagimsiz") return CATEGORY_VARIANT.bagimsiz;
    if (normalized === "deneysel") return CATEGORY_VARIANT.deneysel;
  }

  return "neutral";
}

function resolveLabel(
  children: string | undefined,
  category: FilmCategory | string | undefined
): string {
  if (children) return children;

  if (category) {
    const normalized = category.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized === "auteur") return CATEGORY_LABELS.auteur;
    if (normalized === "bagimsiz") return CATEGORY_LABELS.bagimsiz;
    if (normalized === "deneysel") return CATEGORY_LABELS.deneysel;
  }

  return "";
}

export function Badge({ children, category, variant, className = "" }: BadgeProps) {
  const resolvedVariant = resolveVariant(variant, category);
  const label = resolveLabel(children, category);

  if (!label) return null;

  return (
    <span
      className={`inline-block rounded-none border px-[9px] py-[5px] font-mono text-[10px] tracking-[0.14em] uppercase ${VARIANT_STYLES[resolvedVariant]} ${className}`}
    >
      {label}
    </span>
  );
}
