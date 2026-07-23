"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleWatched, toggleFavorite } from "@/app/films/actions";
import { useDataLayer } from "@hooks/useDataLayer";

type FilmActionsProps = {
  filmId: number;
  filmTitle?: string;
  initialWatched: boolean;
  initialFavorited: boolean;
  isLoggedIn: boolean;
};

export function FilmActions({
  filmId,
  filmTitle = "",
  initialWatched,
  initialFavorited,
  isLoggedIn,
}: FilmActionsProps) {
  const [watched, setWatched] = useState(initialWatched);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const { pushGAEvent } = useDataLayer();
  const pathname = usePathname();
  const router = useRouter();

  function handleWatched() {
    if (!isLoggedIn || isPending) return;
    startTransition(async () => {
      try {
        const result = await toggleWatched(filmId);
        setWatched(result.watched);
        toast.success(result.watched ? "İzleme geçmişine eklendi." : "İzleme geçmişinden kaldırıldı.");
        if (result.watched) {
          pushGAEvent({
            eventCategory: "Film",
            eventAction: "Add to Watch History",
            eventLabel: filmTitle,
          });
        }
      } catch {
        toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    });
  }

  function handleFavorite() {
    if (!isLoggedIn || isPending) return;
    startTransition(async () => {
      try {
        const result = await toggleFavorite(filmId);
        setFavorited(result.favorited);
        toast.success(result.favorited ? "Favorilere eklendi." : "Favorilerden kaldırıldı.");
        if (result.favorited) {
          pushGAEvent({
            eventCategory: "Film",
            eventAction: "Add to Favorites",
            eventLabel: filmTitle,
          });
        }
      } catch {
        toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    });
  }

  function goToAuth() {
    // pathname already has the correct locale prefix (or none for TR default)
    const authBase = pathname.startsWith("/en/") ? "/en/auth" : "/auth";
    router.push(`${authBase}?next=${encodeURIComponent(pathname)}`);
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={goToAuth}
          className="flex items-center gap-2 border border-ce-border px-5 py-3 font-mono text-[11px] tracking-[0.14em] uppercase text-ce-muted hover:border-[#3a3a3a] hover:text-ce-text transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Favorile
        </button>
        <button
          onClick={goToAuth}
          className="flex items-center gap-2 border border-ce-border px-5 py-3 font-mono text-[11px] tracking-[0.14em] uppercase text-ce-muted hover:border-[#3a3a3a] hover:text-ce-text transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          İzledim mi?
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleWatched}
        disabled={isPending}
        className={`flex items-center gap-2 border px-5 py-3 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors disabled:opacity-50 ${
          watched
            ? "border-ce-accent bg-ce-accent text-ce-bg"
            : "border-ce-border text-ce-muted hover:border-[#3a3a3a] hover:text-ce-text"
        }`}
      >
        <span>{watched ? "✓" : "○"}</span>
        {watched ? "İzledim" : "İzledim mi?"}
      </button>

      <button
        onClick={handleFavorite}
        disabled={isPending}
        className={`flex items-center gap-2 border px-5 py-3 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors disabled:opacity-50 ${
          favorited
            ? "border-ce-accent text-ce-accent"
            : "border-ce-border text-ce-muted hover:border-[#3a3a3a] hover:text-ce-text"
        }`}
      >
        <span>{favorited ? "♥" : "♡"}</span>
        {favorited ? "Favorilendi" : "Favorile"}
      </button>
    </div>
  );
}
