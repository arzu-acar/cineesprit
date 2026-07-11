import { requireAdmin } from "@lib/supabase/admin";
import { FilmCurateForm } from "./FilmCurateForm";

export default async function AdminFilmNewPage() {
  await requireAdmin();
  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase mb-2">Admin · Filmler</p>
        <h1 className="font-serif italic text-[34px] text-ce-text">Film Ekle</h1>
        <p className="mt-2 text-[13px] text-ce-text-secondary">
          TMDB ID ile film verisi otomatik çekilir. Kürasyon notu ve etiket ekleyebilirsin.
        </p>
      </div>
      <FilmCurateForm />
    </div>
  );
}
