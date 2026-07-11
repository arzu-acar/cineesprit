import { requireAdmin, createAdminClient } from "@lib/supabase/admin";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const admin = createAdminClient();

  const { data: prefs, count } = await supabase
    .from("user_preferences")
    .select("user_id, onboarding_completed, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  // Auth'dan email bilgilerini çek
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 50 });
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? []).map((u) => [u.id, u.email])
  );

  return (
    <div className="p-10">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ce-muted uppercase mb-2">Admin · Kullanıcılar</p>
        <h1 className="font-serif italic text-[34px] text-ce-text">Kullanıcılar</h1>
        <p className="mt-1 font-mono text-[12px] text-ce-muted">Toplam: {count ?? 0}</p>
      </div>

      <div className="border border-ce-border">
        <div className="grid grid-cols-[1fr_200px_140px_80px] gap-4 px-5 py-3 border-b border-ce-border bg-[#0d0d0d]">
          {["E-posta", "Kayıt Tarihi", "Onboarding", ""].map((h, i) => (
            <span key={i} className="font-mono text-[9px] tracking-[0.16em] text-ce-muted uppercase">{h}</span>
          ))}
        </div>

        {(prefs ?? []).length === 0 && (
          <p className="px-5 py-6 font-mono text-[12px] text-ce-muted">Henüz kullanıcı yok.</p>
        )}

        {(prefs ?? []).map((u: { user_id: string; onboarding_completed: boolean; created_at: string }) => (
          <div
            key={u.user_id}
            className="grid grid-cols-[1fr_200px_140px_80px] gap-4 items-center px-5 py-4 border-b border-ce-border hover:bg-[#0a0a0a] transition-colors"
          >
            <div>
              <p className="font-mono text-[12px] text-ce-text truncate">
                {emailMap[u.user_id] ?? "—"}
              </p>
              <p className="font-mono text-[10px] text-[#444] truncate">{u.user_id}</p>
            </div>

            <span className="font-mono text-[11px] text-ce-muted">
              {new Date(u.created_at).toLocaleDateString("tr-TR", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>

            <span className={`font-mono text-[10px] uppercase tracking-widest ${
              u.onboarding_completed ? "text-ce-accent" : "text-[#555]"
            }`}>
              {u.onboarding_completed ? "✓ Tamamlandı" : "Bekliyor"}
            </span>

            <DeleteUserButton
              userId={u.user_id}
              email={emailMap[u.user_id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
