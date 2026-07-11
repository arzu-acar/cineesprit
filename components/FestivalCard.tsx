"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDataLayer } from "@hooks/useDataLayer";
import { useImpression } from "@hooks/useImpression";

export type Festival = {
  id: string;
  name: string;
  country: string;
  city?: string | null;
  location?: string | null;
  start_date: string;
  end_date: string;
  description?: string | null;
  cover_url?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
};

type FestivalCardProps = {
  festival: Festival;
  listName?: string;
  position?: number;
};

function formatDateRange(start: string, end: string, locale: string): string {
  const intlLocale = locale === "tr" ? "tr-TR" : "en-US";
  const startDate = new Date(start);
  const endDate = new Date(end);

  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const startStr = startDate.toLocaleDateString(intlLocale, opts);
  const endStr = endDate.toLocaleDateString(intlLocale, { ...opts, year: "numeric" });

  return `${startStr} – ${endStr}`;
}

export function FestivalCard({ festival, listName = "Festival Takvimi", position = 0 }: FestivalCardProps) {
  const locale = useLocale();
  const t = useTranslations("festivals");
  const dateRange = formatDateRange(festival.start_date, festival.end_date, locale);
  const now = new Date();
  const endDate = new Date(festival.end_date);
  const startDate = new Date(festival.start_date);

  let status: "upcoming" | "ongoing" | "past";
  if (now < startDate) status = "upcoming";
  else if (now <= endDate) status = "ongoing";
  else status = "past";

  const statusLabel =
    status === "ongoing" ? t("statusOngoing") :
    status === "upcoming" ? t("statusUpcoming") :
    t("statusPast");

  const statusColor =
    status === "ongoing"
      ? "text-ce-accent border-ce-accent"
      : status === "upcoming"
      ? "text-[#c8c8c6] border-[#3a3a3a]"
      : "text-ce-muted border-ce-border";

  const { pushProductImpression } = useDataLayer();

  const impressionRef = useImpression<HTMLAnchorElement>(() => {
    pushProductImpression(
      [
        {
          name: festival.name,
          id: festival.id,
          brand: festival.country,
          category: "Festival",
          list: listName,
          position,
        },
      ],
      festival.name
    );
  });

  return (
    <Link
      ref={impressionRef}
      href={`/festivals/${festival.id}` as `/festivals/${string}`}
      className="group block border border-ce-border bg-ce-panel p-6 transition-colors hover:border-[#3a3a3a]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.16em] text-ce-muted uppercase">
          {festival.country.toUpperCase()}{festival.city ? ` · ${festival.city}` : ""}
        </p>
        <span
          className={`shrink-0 border px-2 py-1 font-mono text-[9px] tracking-[0.12em] uppercase ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <h3 className="mb-3 font-serif text-[22px] font-normal italic leading-[1.12] text-ce-text transition-colors group-hover:text-ce-accent">
        {festival.name}
      </h3>

      <p className="mb-4 font-mono text-[11px] tracking-[0.1em] text-ce-muted">
        {dateRange}
      </p>

      {festival.description ? (
        <p className="text-[13px] leading-[1.6] text-ce-text-secondary line-clamp-2">
          {festival.description}
        </p>
      ) : null}
    </Link>
  );
}
