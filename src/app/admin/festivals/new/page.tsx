import { requireAdmin } from "@lib/supabase/admin";
import { FestivalForm } from "../FestivalForm";

export default async function AdminFestivalNewPage() {
  await requireAdmin();
  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase mb-2">Admin · Festivaller</p>
        <h1 className="font-serif italic text-[34px] text-ce-text">Festival Ekle</h1>
      </div>
      <FestivalForm />
    </div>
  );
}
