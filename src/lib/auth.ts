import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** Chỉ cho người đã đăng nhập VÀ có tên trong bảng admins đi tiếp. */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) redirect("/admin/login?loi=quyen");

  return { supabase, user };
}
