import { requireAdmin } from "@lib/supabase/admin";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { FestivalForm } from "../../FestivalForm";
import { notFound } from "next/navigation";

export default async function AdminFestivalEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("festivals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase mb-2">Admin · Festivaller</p>
        <h1 className="font-serif italic text-[34px] text-ce-text">Festival Düzenle</h1>
        <p className="mt-1 font-mono text-[12px] text-ce-muted">{data.name}</p>
      </div>
      <FestivalForm festival={data} />
    </div>
  );
}
