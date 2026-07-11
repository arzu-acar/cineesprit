import Link from "next/link";
import { requireAdmin } from "@lib/supabase/admin";
import { createSupabaseServerClient } from "@lib/supabase/server";
import type { Festival } from "@components/FestivalCard";
import { DeleteFestivalButton } from "./DeleteFestivalButton";

export default async function AdminFestivalsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: festivals } = await supabase
    .from("festivals")
    .select("id, name, country, city, start_date, end_date")
    .order("start_date", { ascending: false })
    .limit(100);

  return (
    <div className="p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase mb-2">Admin · İçerik</p>
          <h1 className="font-serif italic text-[34px] text-ce-text">Festivaller</h1>
        </div>
        <Link
          href="/admin/festivals/new"
          className="bg-ce-accent text-ce-bg font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-3 hover:opacity-90 transition-opacity"
        >
          + Festival Ekle
        </Link>
      </div>

      {!festivals || festivals.length === 0 ? (
        <p className="font-mono text-[12px] text-ce-muted">Henüz festival yok.</p>
      ) : (
        <div className="border border-ce-border">
          <div className="grid grid-cols-[1fr_120px_160px_120px_80px] gap-4 px-5 py-3 border-b border-ce-border bg-[#0d0d0d]">
            {["Festival", "Ülke", "Tarih", "Konum", ""].map((h, i) => (
              <span key={i} className="font-mono text-[9px] tracking-[0.16em] text-ce-muted uppercase">{h}</span>
            ))}
          </div>
          {(festivals as Pick<Festival, "id" | "name" | "country" | "city" | "start_date" | "end_date">[]).map((f) => (
            <div key={f.id} className="grid grid-cols-[1fr_120px_160px_120px_80px] gap-4 items-center px-5 py-4 border-b border-ce-border hover:bg-[#0d0d0d] transition-colors">
              <p className="font-serif italic text-[15px] text-ce-text">{f.name}</p>
              <span className="font-mono text-[11px] text-ce-muted">{f.country}</span>
              <span className="font-mono text-[10px] text-ce-muted">
                {f.start_date} – {f.end_date}
              </span>
              <span className="font-mono text-[11px] text-ce-muted truncate">{f.city}</span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/festivals/edit/${f.id}`}
                  className="font-mono text-[10px] tracking-[0.1em] text-ce-muted uppercase hover:text-ce-text transition-colors"
                >
                  Düzenle
                </Link>
                <DeleteFestivalButton festivalId={f.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
