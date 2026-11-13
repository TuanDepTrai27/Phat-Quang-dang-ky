// Kiểm thử đơn vị cho src/lib/stats.ts. Chạy: npm test
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeEventStats } from "../../src/lib/stats.ts";

const base = {
  status: "approved" as const,
  gender: null,
  birth_year: null,
  province: null,
  is_first_time: false,
  needs_lodging: false,
  created_at: "2026-11-10T03:00:00Z",
  checked_in_at: null,
};
const row = (o: Partial<typeof base> & Record<string, unknown> = {}) => ({ ...base, ...o }) as any;

describe("computeEventStats", () => {
  it("danh sách rỗng", () => {
    const s = computeEventStats([]);
    assert.equal(s.total, 0);
    assert.equal(s.active, 0);
    assert.equal(s.attendanceRate, null);
    assert.deepEqual(s.byDay, []);
    assert.deepEqual(s.topProvinces, []);
  });

  it("đếm theo trạng thái và tỷ lệ có mặt", () => {
    const s = computeEventStats([
      row({ checked_in_at: "2026-11-20T01:00:00Z" }),
      row({ checked_in_at: "2026-11-20T01:05:00Z" }),
      row(),
      row(),
      row({ status: "pending" }),
      row({ status: "cancelled" }),
      row({ status: "rejected" }),
    ]);
    assert.deepEqual(s.byStatus, { pending: 1, approved: 4, rejected: 1, cancelled: 1 });
    assert.equal(s.active, 5);
    assert.equal(s.checkedIn, 2);
    assert.equal(s.attendanceRate, 0.5);
  });

  it("chỉ số người tham dự bỏ qua đăng ký đã hủy hoặc bị từ chối", () => {
    const s = computeEventStats([
      row({ gender: "nam", is_first_time: true, needs_lodging: true }),
      row({ gender: "nu", status: "pending" }),
      row({ gender: "nu", status: "cancelled", is_first_time: true, needs_lodging: true }),
      row({ status: "rejected" }),
    ]);
    assert.deepEqual(s.gender, { nam: 1, nu: 1, khac: 0 });
    assert.equal(s.firstTime, 1);
    assert.equal(s.lodging, 1);
  });

  it("nhóm tuổi tính theo năm truyền vào", () => {
    const s = computeEventStats(
      [row({ birth_year: 2010 }), row({ birth_year: 2000 }), row({ birth_year: 1990 }), row({ birth_year: 1950 })],
      2026
    );
    const g = Object.fromEntries(s.ageGroups.map((a) => [a.label, a.count]));
    assert.equal(g["Dưới 18"], 1); // 16 tuổi
    assert.equal(g["18–30"], 1); // 26
    assert.equal(g["31–45"], 1); // 36
    assert.equal(g["Trên 60"], 1); // 76
  });

  it("gộp tỉnh viết khác hoa thường, khoảng trắng và xếp giảm dần", () => {
    const s = computeEventStats([
      row({ province: "Hà Nội" }),
      row({ province: "  hà   nội " }),
      row({ province: "Hải Phòng" }),
      row({ province: "Bắc Ninh" }),
      row({ province: "Bắc Ninh" }),
      row({ province: "Bắc Ninh" }),
    ]);
    assert.deepEqual(s.topProvinces, [
      { name: "Bắc Ninh", count: 3 },
      { name: "Hà Nội", count: 2 },
      { name: "Hải Phòng", count: 1 },
    ]);
  });

  it("đếm theo ngày theo giờ Việt Nam (UTC+7)", () => {
    const s = computeEventStats([
      row({ created_at: "2026-11-10T16:59:00Z" }), // 23:59 ngày 10 giờ VN
      row({ created_at: "2026-11-10T17:00:00Z" }), // 00:00 ngày 11 giờ VN
      row({ created_at: "2026-11-11T02:00:00Z" }),
    ]);
    assert.deepEqual(s.byDay, [
      { day: "2026-11-10", count: 1 },
      { day: "2026-11-11", count: 2 },
    ]);
  });
});
