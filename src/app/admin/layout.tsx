import Link from "next/link";
import { requireAdmin } from "@lib/supabase/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex bg-ce-bg">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-ce-border flex flex-col">
        <div className="px-6 py-5 border-b border-ce-border">
          <Link href="/" className="font-serif italic text-[18px] text-ce-text hover:text-ce-accent transition-colors">
            CineEsprit
          </Link>
          <p className="mt-1 font-mono text-[9px] tracking-[0.18em] text-ce-muted uppercase">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4">
          <p className="px-6 mb-2 font-mono text-[9px] tracking-[0.16em] text-[#444] uppercase">İçerik</p>
          <AdminLink href="/admin" exact label="Genel Bakış" />
          <AdminLink href="/admin/films" label="Filmler" />
          <AdminLink href="/admin/films/new" label="Film Ekle" indent />
          <AdminLink href="/admin/festivals" label="Festivaller" />
          <AdminLink href="/admin/festivals/new" label="Festival Ekle" indent />

          <p className="px-6 mt-6 mb-2 font-mono text-[9px] tracking-[0.16em] text-[#444] uppercase">Kullanıcılar</p>
          <AdminLink href="/admin/users" label="Kullanıcılar" />
        </nav>

        <div className="px-6 py-4 border-t border-ce-border">
          <Link href="/" className="font-mono text-[10px] tracking-[0.12em] text-ce-muted uppercase hover:text-ce-text transition-colors">
            ← Siteye Dön
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function AdminLink({
  href,
  label,
  indent = false,
  exact = false,
}: {
  href: string;
  label: string;
  indent?: boolean;
  exact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-6 py-[9px] font-mono text-[11px] tracking-[0.1em] text-ce-muted uppercase transition-colors hover:text-ce-text hover:bg-[#111] ${indent ? "pl-10" : ""}`}
    >
      {label}
    </Link>
  );
}
