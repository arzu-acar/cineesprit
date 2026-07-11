"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";

const STATUS_VALUES = ["", "ongoing", "upcoming", "past"] as const;

type FestivalFiltersProps = {
  status: string;
  country: string;
  countries: string[];
};

export function FestivalFilters({ status, country, countries }: FestivalFiltersProps) {
  const t = useTranslations("filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => router.push(pathname));
  }, [router, pathname]);

  const hasFilters = status || country;

  const selectClass =
    "w-full appearance-none bg-[#0d0d0d] border border-ce-border px-4 py-3 font-mono text-[11px] tracking-[0.12em] text-ce-text-secondary uppercase focus:outline-none focus:border-[#3a3a3a] transition-colors cursor-pointer";

  return (
    <div className={`transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Status */}
        <div>
          <label className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase">
            {t("status")}
          </label>
          <select
            value={status}
            onChange={(e) => update("status", e.target.value)}
            className={selectClass}
          >
            {STATUS_VALUES.map((val) => (
              <option key={val} value={val}>
                {val === "" ? t("all") : t(`statuses.${val}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase">
            {t("country")}
          </label>
          <select
            value={country}
            onChange={(e) => update("country", e.target.value)}
            className={selectClass}
          >
            <option value="">{t("all")}</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters ? (
        <button
          onClick={clearAll}
          className="mt-4 font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
        >
          {t("clearFilters")}
        </button>
      ) : null}
    </div>
  );
}
