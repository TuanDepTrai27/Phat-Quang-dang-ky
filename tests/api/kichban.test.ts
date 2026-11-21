/**
 * Kiểm thử tổng thể theo kịch bản (Bảng 5.5 của báo cáo lần 3), phần tự động hóa được:
 * phân quyền trang quản trị, chặn chuyển hướng lạ, sự kiện đóng/đã qua/chưa công khai,
 * mã QR, tải CSV, trang check-in và trang thống kê khi đã đăng nhập.
 *
 * Điều kiện chạy giống tests/api/api.test.ts. Chạy: npm run test:api
 * Bài test tự tạo các sự kiện tạm, chạy xong tự xóa.
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

/** Mở một trang của web; không tự đi theo chuyển hướng để kiểm tra được đích chuyển hướng. */
const page = (path: string, cookie = "") =>
  fetch(API + path, { redirect: "manual", headers: cookie ? { cookie } : {} });

async function post(path: string, body: unknown): Promise<{ status: number; body: Json }> {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as Json };
}

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

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

/**
 * Dựng cookie phiên đăng nhập giống cách thư viện @supabase/ssr lưu trong trình duyệt:
 * tên sb-<mã dự án>-auth-token, giá trị "base64-" + JSON phiên mã hóa base64url, chia khúc 3180 ký tự.
 */
function sessionCookie(session: Json): string {
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const name = `sb-${ref}-auth-token`;
  const full = { ...session, expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in };
  const value = "base64-" + Buffer.from(JSON.stringify(full)).toString("base64url");
  const SIZE = 3180;
  if (value.length <= SIZE) return `${name}=${value}`;
  const parts: string[] = [];
  for (let i = 0; i * SIZE < value.length; i++) parts.push(`${name}.${i}=${value.slice(i * SIZE, (i + 1) * SIZE)}`);
  return parts.join("; ");
}

describe("Kiểm thử theo kịch bản", { skip: missing.length ? `thiếu biến môi trường: ${missing.join(", ")}` : false }, () => {
  let token = "";
  let cookie = "";
  const events: Record<string, string> = {};
  let code = "";

  before(async () => {
    const auth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert.equal(auth.status, 200, "Đăng nhập admin thất bại");
    const session = (await auth.json()) as Json;
    token = session.access_token;
    cookie = sessionCookie(session);

    const make = async (key: string, o: Json) => {
      const r = await supa(token, "events", {
        method: "POST",
        body: JSON.stringify({
          slug: `kiem-thu-kb-${key}-${Date.now()}`,
          title: `Sự kiện kiểm thử kịch bản (${key})`,
          event_type: "khac",
          start_date: day(40),
          end_date: day(40),
          capacity: null,
          registration_open: true,
          published: true,
          ...o,
        }),
      });
      assert.equal(r.status, 201, r.text);
      events[key] = r.body[0].id;
    };
    await make("mo", {});
    await make("dong", { registration_open: false });
    await make("qua", { start_date: day(-3), end_date: day(-2) });
    await make("an", { published: false });

    // Một đăng ký đã duyệt và check-in để kiểm tra CSV, trang check-in, thống kê
    const r = await post("/api/v1/registrations", {
      event_id: events.mo, full_name: "Người kiểm thử CSV", phone: "0968000001", birth_year: 1995, gender: "nu",
      province: "=1+1", // thử chèn công thức Excel
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    code = r.body.data.code;
    const ck = await supa(token, "rpc/check_in_registration", {
      method: "POST",
      body: JSON.stringify({ p_code: code, p_approve: true }),
    });
    assert.equal(ck.status, 200, ck.text);
  });

  after(async () => {
    for (const id of Object.values(events)) await supa(token, `events?id=eq.${id}`, { method: "DELETE" });
  });

  it("KB07: chưa đăng nhập thì mọi trang quản trị đều chuyển về đăng nhập, kèm trang cần quay lại", async () => {
    const paths = [
      "/admin",
      `/admin/check-in?ma=${code}`,
      `/admin/su-kien/${events.mo}`,
      `/admin/su-kien/${events.mo}/export`,
      "/admin/dia-diem",
    ];
    for (const p of paths) {
      const res = await page(p);
      assert.ok([302, 303, 307, 308].includes(res.status), `${p}: mã ${res.status}`);
      const to = new URL(res.headers.get("location") ?? "", API);
      assert.equal(to.pathname, "/admin/login", p);
      if (p !== "/admin") assert.equal(to.searchParams.get("tiep"), p, p);
    }
  });

  it("KB07: tải CSV khi chưa đăng nhập không lộ dữ liệu", async () => {
    const res = await page(`/admin/su-kien/${events.mo}/export`);
    const text = await res.text();
    assert.ok(!text.includes("0968000001"));
  });

  it("KB11: sự kiện đóng đăng ký hoặc đã diễn ra thì không nhận đăng ký; sự kiện chưa công khai coi như không có", async () => {
    const person = { full_name: "Người thử đóng", phone: "0968000002", birth_year: 1990, gender: "nam" };
    for (const key of ["dong", "qua"]) {
      const r = await post("/api/v1/registrations", { event_id: events[key], ...person });
      assert.equal(r.status, 409, key);
      assert.equal(r.body.error.code, "REGISTRATION_CLOSED", key);
    }
    const hidden = await post("/api/v1/registrations", { event_id: events.an, ...person });
    assert.equal(hidden.status, 404);
    assert.equal(hidden.body.error.code, "EVENT_NOT_FOUND");
  });

  it("KB01: trang đăng ký thành công có mã QR trỏ tới trang check-in; mã sai thì không có QR", async () => {
    const ok = await (await page(`/dang-ky/thanh-cong?ma=${code}`)).text();
    assert.ok(ok.includes("<svg"), "thiếu mã QR");
    assert.ok(ok.includes(code));
    const bad = await (await page("/dang-ky/thanh-cong?ma=khong-hop-le")).text();
    assert.ok(!bad.includes("Mã QR check-in"));
  });

  it("Các trang công khai mở được", async () => {
    for (const p of ["/", "/tra-cuu", "/tai-lieu-api", "/api/v1/openapi.json"]) {
      const res = await page(p);
      assert.equal(res.status, 200, p);
    }
  });

  it("KB10: CSV đúng tiếng Việt, giữ số 0 đầu, có cột Check-in, chặn công thức", async () => {
    const res = await page(`/admin/su-kien/${events.mo}/export`, cookie);
    assert.equal(res.status, 200, "cookie đăng nhập không được chấp nhận (xem hàm sessionCookie)");
    assert.match(res.headers.get("content-type") ?? "", /text\/csv/);
    const buf = Buffer.from(await res.arrayBuffer());
    assert.deepEqual([...buf.subarray(0, 3)], [0xef, 0xbb, 0xbf], "thiếu BOM UTF-8");
    const text = buf.toString("utf8");
    assert.ok(text.includes("Check-in"));
    assert.ok(text.includes('="0968000001"'), "mất số 0 đầu");
    assert.ok(text.includes(`"'=1+1"`), "ô bắt đầu bằng = phải được chèn dấu nháy để Excel không chạy công thức");
  });

  it("KB06: quét lại mã đã check-in thì trang báo đã check-in, không còn nút Check-in", async () => {
    const res = await page(`/admin/check-in?ma=${code}`, cookie);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Đã check-in lúc"));
    assert.ok(!html.includes(">Check-in</button>"));
  });

  it("Trang quản trị sự kiện có danh sách, thống kê và nhật ký check-in", async () => {
    const html = await (await page(`/admin/su-kien/${events.mo}`, cookie)).text();
    assert.ok(html.includes(code));
    assert.ok(html.includes("Thống kê"));
    assert.ok(html.includes("Check-in tại sự kiện"));
  });
});
