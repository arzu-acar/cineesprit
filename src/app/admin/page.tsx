import Link from "next/link";
import { requireAdmin } from "@lib/supabase/admin";
import { createSupabaseServerClient } from "@lib/supabase/server";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ count: festivalCount }, { count: userCount }] = await Promise.all([
    supabase.from("festivals").select("*", { count: "exact", head: true }),
    supabase.from("user_preferences").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase mb-2">Admin Panel</p>
        <h1 className="font-serif italic text-[38px] text-ce-text">Genel Bakış</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <StatCard label="Festival" value={festivalCount ?? 0} href="/admin/festivals" />
        <StatCard label="Kullanıcı" value={userCount ?? 0} href="/admin/users" />
        <StatCard label="TMDB Entegre" value="Aktif" href="/admin/films" accent />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <QuickAction href="/admin/films/new" title="Film Ekle" desc="TMDB ID ile yeni film kür et" />
        <QuickAction href="/admin/festivals/new" title="Festival Ekle" desc="Yeni festival takvime ekle" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href, accent = false }: { label: string; value: number | string; href: string; accent?: boolean }) {
  return (
    <Link href={href} className="block border border-ce-border bg-[#0d0d0d] px-6 py-6 hover:border-[#333] transition-colors">
      <p className="font-mono text-[9px] tracking-[0.18em] text-ce-muted uppercase mb-3">{label}</p>
      <p className={`font-serif italic text-[42px] leading-none ${accent ? "text-ce-accent" : "text-ce-text"}`}>{value}</p>
    </Link>
  );
}

function QuickAction({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block border border-ce-border bg-[#0d0d0d] px-6 py-6 hover:border-[#333] transition-colors group">
      <p className="font-serif italic text-[22px] text-ce-text mb-1 group-hover:text-ce-accent transition-colors">{title} →</p>
      <p className="text-[13px] text-ce-text-secondary">{desc}</p>
    </Link>
  );
}
