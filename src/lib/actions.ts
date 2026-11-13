"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";
import { slugify } from "./format";
import { checkInQrSvg } from "./qr";
import { createClient } from "./supabase/server";
import {
  isEventType,
  type LookupFormState,
  type LookupResult,
  type RegisterFormState,
} from "./types";
import { DB_ERRORS, dbErrorCode, validateLookup, validateRegistration } from "./validation";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/* ------------------------------------------------------------------ */
/* Phía người đăng ký                                                  */
/* ------------------------------------------------------------------ */

function mapError(message: string): string {
  const code = dbErrorCode(message);
  return code ? DB_ERRORS[code].message : "Chưa gửi được đăng ký. Quý Phật tử thử lại sau ít phút.";
}

export async function registerAction(
  _prev: RegisterFormState,
  fd: FormData
): Promise<RegisterFormState> {
  const values: Record<string, string> = {};
  for (const k of ["full_name", "dharma_name", "phone", "birth_year", "gender", "province", "notes"]) {
    values[k] = text(fd, k);
  }
  const slug = text(fd, "slug");

  // Ô ẩn dành cho bot: người thật không thấy nên không điền.
  if (text(fd, "website")) redirect(`/dang-ky/thanh-cong?ma=PQ-XXXXXX&su-kien=${slug}`);

  // Cùng một hàm kiểm tra với REST API (src/lib/validation.ts)
  const checked = validateRegistration({
    ...values,
    event_id: text(fd, "event_id"),
    is_first_time: fd.get("is_first_time"),
    needs_lodging: fd.get("needs_lodging"),
  });
  if (!checked.ok) return { error: Object.values(checked.errors)[0], values };
  const d = checked.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event: d.eventId,
    p_full_name: d.fullName,
    p_dharma_name: d.dharmaName,
    p_phone: d.phone,
    p_birth_year: d.birthYear,
    p_gender: d.gender,
    p_province: d.province,
    p_is_first_time: d.isFirstTime,
    p_needs_lodging: d.needsLodging,
    p_notes: d.notes,
  });

  if (error) return { error: mapError(error.message), values };

  revalidatePath("/");
  redirect(`/dang-ky/thanh-cong?ma=${encodeURIComponent(String(data))}&su-kien=${slug}`);
}

async function doLookup(code: string, phone: string): Promise<LookupResult | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_registration", {
    p_code: code,
    p_phone: phone,
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as LookupResult[];
  return rows[0] ?? null;
}

export async function lookupAction(
  _prev: LookupFormState,
  fd: FormData
): Promise<LookupFormState> {
  const ma = text(fd, "ma").toUpperCase();
  const sdtRaw = text(fd, "sdt");
  const values = { ma, sdt: sdtRaw };
  const checked = validateLookup({ code: ma, phone: sdtRaw });

  if (!checked.ok) {
    return { error: "Vui lòng nhập đúng mã đăng ký (PQ-XXXXXX) và số điện thoại đã dùng khi đăng ký.", values };
  }
  const phone = checked.data.phone;

  let message: string | undefined;
  if (text(fd, "intent") === "cancel") {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("cancel_registration", {
      p_code: checked.data.code,
      p_phone: phone,
    });
    if (error) return { error: "Chưa hủy được đăng ký. Bạn thử lại sau.", values };
    message = data ? "Đã hủy đăng ký." : undefined;
    revalidatePath("/");
  }

  const result = await doLookup(checked.data.code, phone);
  if (!result) {
    return {
      error: "Không tìm thấy đăng ký. Bạn kiểm tra lại mã đăng ký và số điện thoại.",
      values,
    };
  }
  const qr =
    result.status === "pending" || result.status === "approved" ? (await checkInQrSvg(result.code)) ?? undefined : undefined;
  return { result, qr, message, values };
}

/* ------------------------------------------------------------------ */
/* Phía quản trị                                                       */
/* ------------------------------------------------------------------ */

export async function signInAction(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(fd, "email"),
    password: String(fd.get("password") ?? ""),
  });
  const next = safeNext(text(fd, "tiep"));
  if (error) redirect(`/admin/login?loi=sai${next ? `&tiep=${encodeURIComponent(next)}` : ""}`);
  redirect(next ?? "/admin");
}

/** Chỉ cho quay lại trang quản trị nội bộ, chặn chuyển hướng sang trang ngoài (open redirect). */
function safeNext(v: string): string | null {
  return /^\/admin(\/[A-Za-z0-9\-_/]*)?(\?[A-Za-z0-9=&%\-_]*)?$/.test(v) ? v : null;
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveEventAction(fd: FormData) {
  const { supabase } = await requireAdmin();

  const id = text(fd, "id");
  const back = id ? `/admin/su-kien/${id}` : "/admin/su-kien/moi";
  const fail = (msg: string) => redirect(`${back}?loi=${encodeURIComponent(msg)}`);

  const title = text(fd, "title");
  const typeRaw = text(fd, "event_type");
  const start = text(fd, "start_date");
  const end = text(fd, "end_date") || start;
  const capacityRaw = text(fd, "capacity");

  if (!title) fail("Vui lòng nhập tên sự kiện.");
  if (!start) fail("Vui lòng chọn ngày bắt đầu.");
  if (end < start) fail("Ngày kết thúc phải sau hoặc cùng ngày bắt đầu.");
  if (capacityRaw && !(parseInt(capacityRaw, 10) > 0)) fail("Số chỗ phải lớn hơn 0.");

  const payload = {
    title,
    event_type: isEventType(typeRaw) ? typeRaw : "khac",
    venue_id: text(fd, "venue_id") || null,
    start_date: start,
    end_date: end,
    lunar_text: text(fd, "lunar_text") || null,
    cover_url: /^https:\/\//.test(text(fd, "cover_url")) ? text(fd, "cover_url") : null,
    description: text(fd, "description") || null,
    capacity: capacityRaw ? parseInt(capacityRaw, 10) : null,
    registration_open: fd.get("registration_open") === "on",
    published: fd.get("published") === "on",
  };

  let savedId = id;
  if (id) {
    const { error } = await supabase.from("events").update(payload).eq("id", id);
    if (error) fail("Chưa lưu được: " + error.message);
  } else {
    const base = `${slugify(title) || "su-kien"}-${start.slice(0, 4)}`;
    let slug = base;
    let created: string | null = null;
    for (let i = 0; i < 4 && !created; i++) {
      const { data, error } = await supabase
        .from("events")
        .insert({ ...payload, slug })
        .select("id")
        .single();
      if (!error && data) {
        created = data.id as string;
      } else if (error?.code === "23505") {
        slug = `${base}-${Math.random().toString(36).slice(2, 5)}`;
      } else {
        fail("Chưa lưu được: " + (error?.message ?? ""));
      }
    }
    if (!created) fail("Chưa tạo được đường dẫn cho sự kiện. Bạn thử lại.");
    savedId = created as string;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/su-kien/${savedId}?da-luu=1`);
}

export async function setRegistrationStatusAction(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const eventId = text(fd, "event_id");
  const status = text(fd, "status");
  if (!["pending", "approved", "rejected"].includes(status)) return;

  // Đã check-in thì không đổi trạng thái nữa (giữ đúng số người thực tế có mặt).
  await supabase.from("registrations").update({ status }).eq("id", id).is("checked_in_at", null);
  revalidatePath(`/admin/su-kien/${eventId}`);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function addVenueAction(fd: FormData) {
  const { supabase } = await requireAdmin();
  const name = text(fd, "name");
  if (!name) return;
  await supabase.from("venues").insert({
    name,
    address: text(fd, "address") || null,
    map_url: text(fd, "map_url") || null,
  });
  revalidatePath("/admin/dia-diem");
}

export async function deleteVenueAction(fd: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("venues").delete().eq("id", text(fd, "id"));
  revalidatePath("/admin/dia-diem");
}

/* ------------------------------------------------------------------ */
/* Check-in tại sự kiện                                                */
/* ------------------------------------------------------------------ */

const CHECKIN_ERRORS: Record<string, string> = {
  NOT_ADMIN: "Tài khoản không có quyền quản trị.",
  REGISTRATION_NOT_FOUND: "Không tìm thấy mã đăng ký này.",
  ALREADY_CHECKED_IN: "Đăng ký này đã check-in trước đó.",
  NOT_APPROVED: "Đăng ký chưa được duyệt (hoặc đã bị từ chối, đã hủy) nên chưa check-in được.",
};

export async function checkInAction(fd: FormData) {
  const { supabase } = await requireAdmin();
  const code = text(fd, "ma").toUpperCase();
  const approve = text(fd, "duyet") === "1";
  const back = text(fd, "tu") === "su-kien" ? text(fd, "event_id") : "";

  const { error } = await supabase.rpc("check_in_registration", { p_code: code, p_approve: approve });
  const key = error ? Object.keys(CHECKIN_ERRORS).find((k) => error.message.includes(k)) : undefined;
  const loi = error ? (key ? CHECKIN_ERRORS[key] : "Chưa check-in được. Thử lại sau ít phút.") : "";

  if (back) {
    revalidatePath(`/admin/su-kien/${back}`);
    redirect(`/admin/su-kien/${back}${loi ? `?loi=${encodeURIComponent(loi)}` : ""}`);
  }
  revalidatePath("/admin/check-in");
  redirect(`/admin/check-in?ma=${encodeURIComponent(code)}${loi ? `&loi=${encodeURIComponent(loi)}` : "&ok=1"}`);
}
