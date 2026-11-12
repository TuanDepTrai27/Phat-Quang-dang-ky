/**
 * Kiểm thử tích hợp REST API trên Supabase thật.
 *
 * Cần:
 *   1. `npm run dev` đang chạy (hoặc đặt API_BASE_URL tới bản đã deploy)
 *   2. Trong .env.local có thêm TEST_ADMIN_EMAIL và TEST_ADMIN_PASSWORD (tài khoản admin)
 * Chạy: npm run test:api
 *
 * Bài test tự tạo một sự kiện tạm 10 chỗ (hiện công khai trong lúc chạy, khoảng vài giây), chạy xong tự xóa.
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "";
const API = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const missing = [
  !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
  !ANON_KEY && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  !ADMIN_EMAIL && "TEST_ADMIN_EMAIL",
  !ADMIN_PASSWORD && "TEST_ADMIN_PASSWORD",
].filter(Boolean);

const CAPACITY = 10;
const CONCURRENT = 50;

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function api(path: string, init: RequestInit = {}): Promise<{ status: number; body: Json }> {
  const res = await fetch(API + path, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
  return { status: res.status, body: (await res.json()) as Json };
}

const post = (path: string, body: unknown) => api(path, { method: "POST", body: JSON.stringify(body) });

/** Gọi thẳng Supabase bằng quyền admin (chỉ để chuẩn bị và dọn dữ liệu test). */
async function rest(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function futureDate(days: number) {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

const person = (i: number) => ({
  full_name: `Người kiểm thử ${i}`,
  phone: `09${String(80000000 + i).padStart(8, "0")}`,
  birth_year: 1990,
  gender: i % 2 ? "nam" : "nu",
});

describe("REST API /api/v1", { skip: missing.length ? `thiếu biến môi trường: ${missing.join(", ")}` : false }, () => {
  let token = "";
  let eventId = "";
  let slug = "";

  before(async () => {
    // Bài test không chạy nếu API chưa bật
    try {
      await fetch(`${API}/api/v1/events`);
    } catch {
      throw new Error(`Không kết nối được ${API}. Chạy "npm run dev" ở một terminal khác trước.`);
    }

    const auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert.equal(auth.status, 200, "Đăng nhập admin thất bại: kiểm tra TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD");
    token = ((await auth.json()) as Json).access_token;

    slug = `kiem-thu-api-${Date.now()}`;
    const [ev] = await rest(token, "events", {
      method: "POST",
      body: JSON.stringify({
        slug,
        title: "Sự kiện kiểm thử tự động",
        event_type: "khac",
        start_date: futureDate(30),
        end_date: futureDate(30),
        capacity: CAPACITY,
        registration_open: true,
        published: true,
      }),
    });
    eventId = ev.id;
  });

  after(async () => {
    if (token && eventId) await rest(token, `events?id=eq.${eventId}`, { method: "DELETE" });
  });

  it("GET /events trả danh sách có trạng thái và số chỗ còn lại", async () => {
    const { status, body } = await api("/api/v1/events?upcoming=true");
    assert.equal(status, 200);
    const ev = (body.data as Json[]).find((e) => e.id === eventId);
    assert.ok(ev, "sự kiện kiểm thử phải có trong danh sách");
    assert.equal(ev.state, "open");
    assert.equal(ev.seats_left, CAPACITY);
  });

  it("GET /events?type=sai trả 400", async () => {
    const { status, body } = await api("/api/v1/events?type=abc");
    assert.equal(status, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  it("GET /events/{slug} không tồn tại trả 404", async () => {
    const { status, body } = await api("/api/v1/events/khong-co-su-kien-nay");
    assert.equal(status, 404);
    assert.equal(body.error.code, "EVENT_NOT_FOUND");
  });

  it("POST /registrations từ chối dữ liệu sai và nội dung không phải JSON", async () => {
    const bad = await post("/api/v1/registrations", { event_id: eventId, full_name: "A", phone: "123" });
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error.code, "VALIDATION_ERROR");
    assert.ok(bad.body.error.fields.phone);
    assert.ok(bad.body.error.fields.birth_year);

    const notJson = await api("/api/v1/registrations", { method: "POST", body: "full_name=A", headers: { "content-type": "text/plain" } });
    assert.equal(notJson.status, 400);
    assert.equal(notJson.body.error.code, "BAD_REQUEST");
  });

  it(`${CONCURRENT} người đăng ký cùng lúc, chỉ đúng ${CAPACITY} người được nhận`, async () => {
    const results = await Promise.all(
      Array.from({ length: CONCURRENT }, (_, i) => post("/api/v1/registrations", { event_id: eventId, ...person(i) }))
    );
    const created = results.filter((r) => r.status === 201);
    const full = results.filter((r) => r.status === 409 && r.body.error.code === "EVENT_FULL");
    const other = results.filter((r) => r.status !== 201 && !(r.status === 409 && r.body.error.code === "EVENT_FULL"));

    assert.equal(other.length, 0, `có phản hồi lạ: ${JSON.stringify(other.slice(0, 3))}`);
    assert.equal(created.length, CAPACITY);
    assert.equal(full.length, CONCURRENT - CAPACITY);
    for (const r of created) assert.match(r.body.data.code, /^PQ-[A-Z0-9]{6}$/);

    const rows = await rest(token, `registrations?event_id=eq.${eventId}&select=id`);
    assert.equal(rows.length, CAPACITY, "trong cơ sở dữ liệu cũng phải đúng bằng số chỗ");
  });

  it("tra cứu, hủy, hủy lần hai, rồi chỗ được nhả cho người khác", async () => {
    const [reg] = await rest(token, `registrations?event_id=eq.${eventId}&select=code,phone&limit=1`);

    const wrongPhone = await post("/api/v1/registrations/lookup", { code: reg.code, phone: "0999999999" });
    assert.equal(wrongPhone.status, 404, "sai số điện thoại thì không được xem");

    const found = await post("/api/v1/registrations/lookup", { code: reg.code.toLowerCase(), phone: reg.phone });
    assert.equal(found.status, 200);
    assert.equal(found.body.data.status, "pending");
    assert.equal(found.body.data.event.slug, slug);

    const cancel = await post("/api/v1/registrations/cancel", { code: reg.code, phone: reg.phone });
    assert.equal(cancel.status, 200);
    const again = await post("/api/v1/registrations/cancel", { code: reg.code, phone: reg.phone });
    assert.equal(again.status, 404, "không hủy được hai lần");

    const newcomer = await post("/api/v1/registrations", { event_id: eventId, ...person(999) });
    assert.equal(newcomer.status, 201, "hủy xong phải còn 1 chỗ");
  });

  it("đăng ký trùng họ tên + số điện thoại bị từ chối", async () => {
    const dup = await post("/api/v1/registrations", { event_id: eventId, ...person(999) });
    assert.equal(dup.status, 409);
    assert.equal(dup.body.error.code, "ALREADY_REGISTERED");
  });

  it("nhật ký thao tác ghi lại việc người đăng ký tự hủy", async (t) => {
    let logs: Json[];
    try {
      logs = await rest(token, `audit_logs?event_id=eq.${eventId}&action=eq.registration.status&select=actor_id,changes`);
    } catch {
      t.skip("chưa chạy migrations/003_nhat_ky_thao_tac.sql");
      return;
    }
    const selfCancel = logs.find((l) => l.changes?.moi === "cancelled");
    assert.ok(selfCancel, "phải có dòng nhật ký hủy");
    assert.equal(selfCancel.actor_id, null, "người tự hủy không đăng nhập nên actor_id = null");
  });
});
