// Kiểm thử đơn vị cho src/lib/validation.ts. Chạy: npm test
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dbErrorCode,
  normalizeCode,
  normalizePhone,
  slugify,
  validateLookup,
  validateRegistration,
} from "../../src/lib/validation.ts";

const NOW = new Date("2026-11-12T12:00:00+07:00");
const EVENT_ID = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";

const valid = {
  event_id: EVENT_ID,
  full_name: "  Nguyễn   Văn An ",
  phone: "+84 912 345 678",
  birth_year: "1985",
  gender: "nam",
};

describe("normalizePhone", () => {
  it("chấp nhận các cách viết phổ biến", () => {
    for (const raw of ["0912345678", "0912 345 678", "0912.345.678", "+84912345678", "84912345678", "(091) 234-5678"]) {
      assert.equal(normalizePhone(raw), "0912345678", raw);
    }
  });
  it("từ chối số sai độ dài hoặc có chữ", () => {
    for (const raw of ["", "091234567", "09123456789", "1912345678", "09123abc78", "+1 912 345 678"]) {
      assert.equal(normalizePhone(raw), null, raw);
    }
  });
});

describe("normalizeCode", () => {
  it("viết hoa và bỏ khoảng trắng", () => {
    assert.equal(normalizeCode("  pq-7k3m9x "), "PQ-7K3M9X");
  });
  it("từ chối mã sai định dạng", () => {
    for (const raw of ["", "PQ7K3M9X", "PQ-7K3M9", "XX-7K3M9X", "PQ-7K3M9X1"]) {
      assert.equal(normalizeCode(raw), null, raw);
    }
  });
});

describe("slugify", () => {
  it("bỏ dấu tiếng Việt và ký tự đặc biệt", () => {
    assert.equal(slugify("Đại lễ Phật Đản 2027!"), "dai-le-phat-dan-2027");
    assert.equal(slugify("  Khóa thiền -- tháng 12 "), "khoa-thien-thang-12");
  });
});

describe("validateRegistration", () => {
  it("dữ liệu hợp lệ được chuẩn hóa", () => {
    const r = validateRegistration({ ...valid, is_first_time: "on", needs_lodging: false }, NOW);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.data.fullName, "Nguyễn Văn An");
    assert.equal(r.data.phone, "0912345678");
    assert.equal(r.data.birthYear, 1985);
    assert.equal(r.data.isFirstTime, true);
    assert.equal(r.data.needsLodging, false);
  });

  it("nhận năm sinh dạng số (từ JSON)", () => {
    const r = validateRegistration({ ...valid, birth_year: 1990 }, NOW);
    assert.equal(r.ok, true);
  });

  it("báo lỗi đúng từng trường", () => {
    const r = validateRegistration(
      { event_id: "abc", full_name: "A", phone: "123", birth_year: "2030", gender: "x", notes: "x".repeat(501) },
      NOW
    );
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.deepEqual(Object.keys(r.errors).sort(), ["birth_year", "event_id", "full_name", "gender", "notes", "phone"]);
  });

  it("năm sinh phải từ 1900 đến năm hiện tại", () => {
    assert.equal(validateRegistration({ ...valid, birth_year: "1899" }, NOW).ok, false);
    assert.equal(validateRegistration({ ...valid, birth_year: "2026" }, NOW).ok, true);
    assert.equal(validateRegistration({ ...valid, birth_year: "2027" }, NOW).ok, false);
    assert.equal(validateRegistration({ ...valid, birth_year: "85" }, NOW).ok, false);
  });

  it("bỏ qua kiểu dữ liệu lạ thay vì lỗi", () => {
    const r = validateRegistration({ ...valid, full_name: { $ne: "" }, phone: ["0912345678"] }, NOW);
    assert.equal(r.ok, false);
  });
});

describe("validateLookup", () => {
  it("hợp lệ", () => {
    const r = validateLookup({ code: "pq-abc234", phone: "0912 345 678" });
    assert.deepEqual(r, { ok: true, data: { code: "PQ-ABC234", phone: "0912345678" } });
  });
  it("thiếu cả hai", () => {
    const r = validateLookup({});
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.deepEqual(Object.keys(r.errors).sort(), ["code", "phone"]);
  });
});

describe("dbErrorCode", () => {
  it("nhận ra mã lỗi trong thông báo của Postgres", () => {
    assert.equal(dbErrorCode('P0001: EVENT_FULL'), "EVENT_FULL");
    assert.equal(dbErrorCode("ALREADY_REGISTERED"), "ALREADY_REGISTERED");
    assert.equal(dbErrorCode("connection refused"), null);
    assert.equal(dbErrorCode(undefined), null);
  });
});
