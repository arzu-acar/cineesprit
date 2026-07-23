"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";

const GENRE_IDS = ["18", "99", "36", "878", "53", "10752"] as const;
const LANGUAGE_CODES = ["fr", "it", "de", "ja", "ko", "ru", "fa", "ro"] as const;
const YEARS = Array.from({ length: 35 }, (_, i) => String(2024 - i));

type FilmFiltersProps = {
  query: string;
  genre: string;
  year: string;
  language: string;
};

export function FilmFilters({ query, genre, year, language }: FilmFiltersProps) {
  const t = useTranslations("filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasFilters = query || genre || year || language;

  const selectClass =
    "w-full appearance-none bg-[#0d0d0d] border border-ce-border px-4 py-3 font-mono text-base tracking-[0.12em] text-ce-text-secondary uppercase focus:outline-none focus:border-[#3a3a3a] transition-colors cursor-pointer";

  return (
    <div className={`transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
      {/* Search */}
      <div className="mb-4">
        <label className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase">
          {t("search")}
        </label>
        <div className="border border-ce-border bg-[#0d0d0d] focus-within:border-[#3a3a3a] transition-colors">
          <input
            id="film-search-input"
            type="search"
            defaultValue={query}
            placeholder={t("searchPlaceholder")}
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full bg-transparent border-none outline-none px-4 py-3 text-base text-ce-text placeholder:text-[#5a5a58]"
            style={{ fontSize: "16px", minWidth: 0 }}
            onChange={(e) => {
              const val = e.target.value;
              clearTimeout((window as any).__ceSearchTimer);
              (window as any).__ceSearchTimer = setTimeout(() => update("q", val), 200);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                clearTimeout((window as any).__ceSearchTimer);
                (e.target as HTMLInputElement).blur();
                update("q", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Genre */}
        <div>
          <label className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase">
            {t("genre")}
          </label>
          <select
            value={genre}
            onChange={(e) => update("genre", e.target.value)}
            className={selectClass}
            style={{ fontSize: "16px" }}
          >
            <option value="">{t("all")}</option>
            {GENRE_IDS.map((id) => (
              <option key={id} value={id}>
                {t(`genres.${id}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase">
            {t("year")}
          </label>
          <select
            value={year}
            onChange={(e) => update("year", e.target.value)}
            className={selectClass}
            style={{ fontSize: "16px" }}
          >
            <option value="">{t("all")}</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase">
            {t("language")}
          </label>
          <select
            value={language}
            onChange={(e) => update("language", e.target.value)}
            className={selectClass}
            style={{ fontSize: "16px" }}
          >
            <option value="">{t("all")}</option>
            {LANGUAGE_CODES.map((code) => (
              <option key={code} value={code}>
                {t(`languages.${code}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search button */}
      <button
        type="button"
        onClick={() => {
          const input = document.getElementById("film-search-input") as HTMLInputElement | null;
          if (input) {
            clearTimeout((window as any).__ceSearchTimer);
            update("q", input.value);
          }
        }}
        className="mt-3 w-full px-4 py-3 bg-ce-accent text-[#0a0a0a] font-mono text-[10px] tracking-[0.14em] uppercase font-semibold hover:bg-[#c8ef2e] transition-colors"
      >
        {t("search")}
      </button>

      {/* Clear */}
      {hasFilters ? (
        <button
          onClick={clearAll}
          className="mt-3 font-mono text-[10px] tracking-[0.14em] text-ce-muted uppercase hover:text-ce-accent transition-colors"
        >
          {t("clearFilters")}
        </button>
      ) : null}
    </div>
  );
}
