"use client";

import { useTransition } from "react";
import { deleteFestival } from "./actions";

export function DeleteFestivalButton({ festivalId }: { festivalId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Bu festivali silmek istediğinden emin misin?")) return;
        startTransition(() => deleteFestival(festivalId));
      }}
      className="font-mono text-[10px] tracking-[0.1em] text-[#e0563e] uppercase hover:opacity-70 transition-opacity disabled:opacity-30"
    >
      {isPending ? "..." : "Sil"}
    </button>
  );
}
