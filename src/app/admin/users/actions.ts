"use server";

import { requireAdmin, createAdminClient } from "@lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error("Kullanıcı silinemedi. Lütfen tekrar deneyin.");

  revalidatePath("/admin/users");
}
