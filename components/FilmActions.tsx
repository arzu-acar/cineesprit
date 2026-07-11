"use client";

import { useState, useTransition } from "react";
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

  if (!isLoggedIn) {
    return (
      <p className="font-mono text-[11px] tracking-[0.12em] text-ce-muted uppercase">
        Etkileşim için{" "}
        <a href="/auth" className="text-ce-accent hover:underline">
          giriş yap
        </a>
      </p>
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
