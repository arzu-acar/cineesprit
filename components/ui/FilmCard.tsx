"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import Link from "next/link";
import { tmdbImageUrl } from "@lib/tmdb/client";
import type { FilmCategory } from "@lib/tmdb/types";
import { useDataLayer } from "@hooks/useDataLayer";
import { useImpression } from "@hooks/useImpression";
import { Badge } from "./Badge";

type FilmCardProps = {
  id: number;
  title: string;
  posterPath?: string | null;
  year?: number;
  country?: string;
  runtime?: number;
  overview?: string;
  category?: FilmCategory | string;
  href?: string;
  variant?: "grid" | "panel";
  className?: string;
  listName?: string;
  position?: number;
  director?: string;
};

function formatMeta({
  year,
  country,
  runtime,
}: Pick<FilmCardProps, "year" | "country" | "runtime">): string | null {
  const parts: string[] = [];

  if (year) parts.push(String(year));
  if (country) parts.push(country.toUpperCase());
  if (runtime) parts.push(`${runtime} DK`);

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function FilmCard({
  id,
  title,
  posterPath,
  year,
  country,
  runtime,
  overview,
  category,
  href,
  variant = "grid",
  className = "",
  listName = "",
  position = 0,
  director = "",
}: FilmCardProps) {
  const locale = useLocale();
  const posterUrl = tmdbImageUrl(posterPath, "w500");
  const meta = formatMeta({ year, country, runtime });
  const linkHref = href ?? `/${locale}/films/${id}`;
  const { pushProductImpression, pushProductClick } = useDataLayer();

  const product = {
    name: title,
    id,
    brand: director,
    category: category ?? "",
    list: listName,
    position,
  };

  const impressionRef = useImpression<HTMLDivElement>(() => {
    pushProductImpression([product], title);
  });

  function handleClick() {
    pushProductClick([product], title);
  }

  if (variant === "panel") {
    return (
      <article
        ref={impressionRef}
        className={`overflow-hidden rounded-none border border-ce-border bg-ce-panel ${className}`}
      >
        <Link href={linkHref} onClick={handleClick} className="group block">
          <div className="relative flex aspect-[2/3] items-end bg-[repeating-linear-gradient(135deg,#1a1a1a_0_10px,#161616_10px_20px)] p-[14px]">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 50vw, 280px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="square">
                  <rect x="2" y="4" width="20" height="16" /><line x1="2" y1="8" x2="22" y2="8" /><line x1="2" y1="16" x2="22" y2="16" /><line x1="7" y1="4" x2="7" y2="8" /><line x1="12" y1="4" x2="12" y2="8" /><line x1="17" y1="4" x2="17" y2="8" /><line x1="7" y1="16" x2="7" y2="20" /><line x1="12" y1="16" x2="12" y2="20" /><line x1="17" y1="16" x2="17" y2="20" />
                </svg>
                <span className="font-mono text-[9px] tracking-[0.12em] text-[#3a3a3a] uppercase">Görsel Yok</span>
              </div>
            )}
            <div className="relative z-10">
              <Badge category={category} className="px-2 py-1 text-[9px]" />
            </div>
          </div>
          <div className="p-[18px]">
            {meta ? (
              <p className="mb-[10px] font-mono text-[10px] tracking-[0.16em] text-ce-muted uppercase">
                {meta}
              </p>
            ) : null}
            <h3 className="mb-1.5 font-serif text-[21px] font-normal italic leading-[1.15] text-ce-text transition-colors group-hover:text-ce-accent">
              {title}
            </h3>
            {overview ? (
              <p className="mb-4 line-clamp-3 text-[12.5px] leading-[1.55] text-ce-text-secondary">
                {overview}
              </p>
            ) : null}
            <div className="flex items-center justify-between border-t border-ce-border pt-[14px]">
              <span className="font-mono text-[10px] tracking-[0.08em] text-ce-muted uppercase">
                Dosyaya ekle
              </span>
              <span className="text-[14px] text-ce-accent">→</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <div ref={impressionRef} className={className}>
      <Link href={linkHref} onClick={handleClick} className="group block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-none border border-ce-border bg-[repeating-linear-gradient(135deg,#1a1a1a_0_10px,#151515_10px_20px)] transition-colors group-hover:border-[#3a3a3a]">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="square">
                <rect x="2" y="4" width="20" height="16" /><line x1="2" y1="8" x2="22" y2="8" /><line x1="2" y1="16" x2="22" y2="16" /><line x1="7" y1="4" x2="7" y2="8" /><line x1="12" y1="4" x2="12" y2="8" /><line x1="17" y1="4" x2="17" y2="8" /><line x1="7" y1="16" x2="7" y2="20" /><line x1="12" y1="16" x2="12" y2="20" /><line x1="17" y1="16" x2="17" y2="20" />
              </svg>
              <span className="font-mono text-[9px] tracking-[0.12em] text-[#3a3a3a] uppercase">Görsel Yok</span>
            </div>
          )}
          <div className="absolute top-[11px] left-[11px]">
            <Badge category={category} className="px-1.5 py-1 text-[9px]" />
          </div>
        </div>
        {meta ? (
          <p className="mt-[13px] mb-1.5 font-mono text-[10px] tracking-[0.12em] text-ce-muted uppercase">
            {meta}
          </p>
        ) : null}
        <h3 className="font-serif text-[17px] font-normal italic leading-[1.18] text-ce-text transition-colors group-hover:text-ce-accent">
          {title}
        </h3>
      </Link>
    </div>
  );
}
