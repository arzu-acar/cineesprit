import Link from "next/link";
import { requireAdmin } from "@lib/supabase/admin";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { getFilmDetails, tmdbImageUrl } from "@lib/tmdb/client";

type CuratedFilm = {
  id: string;
  tmdb_id: number;
  curator_note: string | null;
  tags: string[];
  featured: boolean;
  created_at: string;
};

export default async function AdminFilmsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: films } = await supabase
    .from("curated_films")
    .select("id, tmdb_id, curator_note, tags, featured, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const enriched = await Promise.allSettled(
    (films ?? []).map(async (f: CuratedFilm) => {
      const detail = await getFilmDetails(String(f.tmdb_id));
      return { ...f, title: detail.title, poster: detail.poster_path, year: detail.release_date?.slice(0, 4) };
    })
  );

  const rows = enriched
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<ReturnType<typeof Object.assign>>).value);

  return (
    <div className="p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase mb-2">Admin · İçerik</p>
          <h1 className="font-serif italic text-[34px] text-ce-text">Filmler</h1>
        </div>
        <Link
          href="/admin/films/new"
          className="bg-ce-accent text-ce-bg font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-3 hover:opacity-90 transition-opacity"
        >
          + Film Ekle
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="font-mono text-[12px] text-ce-muted">Henüz küre edilmiş film yok.</p>
      ) : (
        <div className="border border-ce-border">
          <div className="grid grid-cols-[40px_1fr_80px_120px_80px] gap-4 px-5 py-3 border-b border-ce-border bg-[#0d0d0d]">
            {["", "Film", "Yıl", "Etiketler", ""].map((h, i) => (
              <span key={i} className="font-mono text-[9px] tracking-[0.16em] text-ce-muted uppercase">{h}</span>
            ))}
          </div>
          {rows.map((f: { id: string; tmdb_id: number; title: string; poster: string; year: string; tags: string[]; featured: boolean }) => (
            <div key={f.id} className="grid grid-cols-[40px_1fr_80px_120px_80px] gap-4 items-center px-5 py-3 border-b border-ce-border hover:bg-[#0d0d0d] transition-colors">
              {f.poster ? (
                <img
                  src={tmdbImageUrl(f.poster, "w92") ?? ""}
                  alt={f.title}
                  className="w-8 h-auto border border-ce-border"
                />
              ) : <div className="w-8 h-10 bg-ce-panel border border-ce-border" />}

              <div>
                <p className="font-serif italic text-[15px] text-ce-text leading-none">{f.title}</p>
                {f.featured && (
                  <span className="font-mono text-[9px] tracking-widest text-ce-accent">ÖNE ÇIKAN</span>
                )}
              </div>
              <span className="font-mono text-[11px] text-ce-muted">{f.year}</span>
              <div className="flex flex-wrap gap-1">
                {f.tags.slice(0, 2).map((t: string) => (
                  <span key={t} className="border border-ce-border px-1 font-mono text-[9px] text-ce-muted">{t}</span>
                ))}
              </div>
              <DeleteFilmButton filmId={f.id} tmdbId={f.tmdb_id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteFilmButton({ filmId, tmdbId }: { filmId: string; tmdbId: number }) {
  return (
    <form
      action={async () => {
        "use server";
        const { requireAdmin: ra } = await import("@lib/supabase/admin");
        const { createSupabaseServerClient: sc } = await import("@lib/supabase/server");
        const { revalidatePath: rp } = await import("next/cache");
        await ra();
        const supabase = await sc();
        await supabase.from("curated_films").delete().eq("id", filmId);
        rp("/admin/films");
      }}
    >
      <button type="submit" className="font-mono text-[10px] tracking-[0.1em] text-[#e0563e] uppercase hover:opacity-70 transition-opacity">
        Sil
      </button>
    </form>
  );
}
