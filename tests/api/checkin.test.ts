/**
 * Kiểm thử tích hợp check-in tại sự kiện (migrations/005_check_in.sql) trên Supabase thật.
 * Điều kiện chạy giống tests/api/api.test.ts. Chạy: npm run test:api
 *
 * Bài test tự tạo một sự kiện tạm (không giới hạn chỗ), chạy xong tự xóa.
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

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function post(path: string, body: unknown): Promise<{ status: number; body: Json }> {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as Json };
}

/** Gọi Supabase REST. token rỗng = khách chưa đăng nhập (anon). Không ném lỗi, trả về status để kiểm tra. */
async function supa(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token || ANON_KEY}`,
      "content-type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null, text };
}

const checkIn = (token: string, code: string, approve = false) =>
  supa(token, "rpc/check_in_registration", {
    method: "POST",
    body: JSON.stringify({ p_code: code, p_approve: approve }),
  });

const futureDate = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const person = (i: number) => ({
  full_name: `Người check-in ${i}`,
  phone: `09${String(70000000 + i).padStart(8, "0")}`,
  birth_year: 1990,
  gender: i % 2 ? "nam" : "nu",
});

describe("Check-in tại sự kiện", { skip: missing.length ? `thiếu biến môi trường: ${missing.join(", ")}` : false }, () => {
  let token = "";
  let eventId = "";
  const codes: Record<string, { code: string; phone: string }> = {};

  before(async () => {
    const auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert.equal(auth.status, 200, "Đăng nhập admin thất bại");
    token = ((await auth.json()) as Json).access_token;

    const probe = await checkIn(token, "PQ-000000");
    if (probe.status === 404 && /check_in_registration/.test(probe.text)) {
      throw new Error("Chưa chạy supabase/migrations/005_check_in.sql trên Supabase.");
    }

    const ev = await supa(token, "events", {
      method: "POST",
      body: JSON.stringify({
        slug: `kiem-thu-checkin-${Date.now()}`,
        title: "Sự kiện kiểm thử check-in",
        event_type: "khac",
        start_date: futureDate(31),
        end_date: futureDate(31),
        capacity: null,
        registration_open: true,
        published: true,
      }),
    });
    assert.equal(ev.status, 201, ev.text);
    eventId = ev.body[0].id;

    // 3 đăng ký: a (sẽ duyệt), b (để chờ duyệt), c (để thử quét đồng thời)
    for (const [k, i] of [["a", 1], ["b", 2], ["c", 3]] as const) {
      const r = await post("/api/v1/registrations", { event_id: eventId, ...person(i) });
      assert.equal(r.status, 201, JSON.stringify(r.body));
      codes[k] = { code: r.body.data.code, phone: person(i).phone };
    }
    for (const k of ["a", "c"]) {
      const u = await supa(token, `registrations?code=eq.${codes[k].code}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });
      assert.equal(u.status, 200, u.text);
    }
  });

  after(async () => {
    if (token && eventId) await supa(token, `events?id=eq.${eventId}`, { method: "DELETE" });
  });

  it("khách chưa đăng nhập không gọi được hàm check-in", async () => {
    const r = await checkIn("", codes.a.code);
    assert.notEqual(r.status, 200);
    const [row] = (await supa(token, `registrations?code=eq.${codes.a.code}&select=checked_in_at`)).body;
    assert.equal(row.checked_in_at, null);
  });

  it("mã không tồn tại báo REGISTRATION_NOT_FOUND", async () => {
    const r = await checkIn(token, "PQ-ZZZZZZ");
    assert.equal(r.status, 400);
    assert.match(r.text, /REGISTRATION_NOT_FOUND/);
  });

  it("đăng ký đang chờ duyệt: không check-in được, trừ khi chọn duyệt luôn", async () => {
    const r = await checkIn(token, codes.b.code);
    assert.match(r.text, /NOT_APPROVED/);

    const ok = await checkIn(token, codes.b.code.toLowerCase(), true);
    assert.equal(ok.status, 200, ok.text);
    const [row] = (await supa(token, `registrations?code=eq.${codes.b.code}&select=status,checked_in_at`)).body;
    assert.equal(row.status, "approved");
    assert.ok(row.checked_in_at);
  });

  it("check-in đăng ký đã duyệt, quét lần hai báo ALREADY_CHECKED_IN", async () => {
    const ok = await checkIn(token, codes.a.code);
    assert.equal(ok.status, 200, ok.text);
    const again = await checkIn(token, codes.a.code);
    assert.match(again.text, /ALREADY_CHECKED_IN/);
  });

  it("hai người quét cùng một mã cùng lúc: chỉ một lần được ghi nhận", async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => checkIn(token, codes.c.code)));
    assert.equal(results.filter((r) => r.status === 200).length, 1);
    assert.equal(results.filter((r) => /ALREADY_CHECKED_IN/.test(r.text)).length, 4);
  });

  it("đã check-in thì người đăng ký không tự hủy được nữa", async () => {
    const r = await post("/api/v1/registrations/cancel", codes.a);
    assert.equal(r.status, 404);
    const [row] = (await supa(token, `registrations?code=eq.${codes.a.code}&select=status`)).body;
    assert.equal(row.status, "approved");
  });

  it("nhật ký thao tác ghi lại check-in kèm người thực hiện", async () => {
    const logs = (await supa(token, `audit_logs?event_id=eq.${eventId}&action=eq.registration.checkin&select=actor_id,changes`)).body as Json[];
    assert.equal(logs.length, 3, "a, b, c mỗi đăng ký một dòng");
    for (const l of logs) assert.ok(l.actor_id, "check-in luôn do quản trị viên làm");
  });
});
