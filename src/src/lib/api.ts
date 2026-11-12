import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { eventState, todayVN } from "./format";
import type { PublicEvent } from "./types";
import { DB_ERRORS, dbErrorCode, type FieldErrors } from "./validation";

/**
 * Tiện ích chung cho REST API /api/v1.
 * Định dạng trả về thống nhất:
 *   thành công: { "data": ... }
 *   lỗi:        { "error": { "code": "EVENT_FULL", "message": "...", "fields": { ... } } }
 */

const MAX_BODY_BYTES = 10_000;

/**
 * Next.js 14 tự lưu đệm (Data Cache) cả các lệnh fetch POST mà supabase-js dùng để gọi hàm Postgres,
 * khiến dữ liệu trả về bị cũ. Ép mọi lệnh gọi Supabase không lưu đệm.
 */
export const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

/** Client Supabase không dùng cookie: API công khai luôn chạy với quyền ẩn danh (anon key + RLS). */
export function publicClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: noStoreFetch },
  });
}

export function ok<T>(data: T, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json({ data }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function fail(status: number, code: string, message: string, fields?: FieldErrors) {
  return NextResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export const validationFailed = (fields: FieldErrors) =>
  fail(400, "VALIDATION_ERROR", "Dữ liệu gửi lên chưa hợp lệ.", fields);

/** Lỗi từ hàm Postgres -> mã HTTP phù hợp (409 hết chỗ, 404 không thấy sự kiện...). */
export function fromDbError(message: string) {
  const code = dbErrorCode(message);
  if (code) return fail(DB_ERRORS[code].status, code, DB_ERRORS[code].message);
  console.error("[api] lỗi cơ sở dữ liệu:", message);
  return fail(500, "INTERNAL_ERROR", "Hệ thống đang bận. Quý Phật tử thử lại sau ít phút.");
}

/** Đọc JSON từ request, giới hạn kích thước. Trả về null nếu không phải JSON hợp lệ dạng object. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const body: unknown = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const badJson = () =>
  fail(400, "BAD_REQUEST", "Nội dung gửi lên phải là JSON (Content-Type: application/json).");

/** Dữ liệu sự kiện trả ra API: thêm trạng thái và số chỗ còn lại. */
export function toApiEvent(e: PublicEvent) {
  return {
    ...e,
    state: eventState(e),
    seats_left: e.capacity == null ? null : Math.max(e.capacity - e.taken, 0),
  };
}

export async function listEvents(): Promise<PublicEvent[] | { error: string }> {
  const { data, error } = await publicClient().rpc("list_public_events");
  if (error) return { error: error.message };
  return (data ?? []) as PublicEvent[];
}

export { todayVN };
