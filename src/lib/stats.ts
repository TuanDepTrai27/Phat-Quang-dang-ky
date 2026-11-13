// Thống kê đăng ký của một sự kiện. Hàm thuần (không gọi CSDL) để kiểm thử đơn vị được.
import type { RegStatus, Registration } from "./types";

type Row = Pick<
  Registration,
  "status" | "gender" | "birth_year" | "province" | "is_first_time" | "needs_lodging" | "created_at" | "checked_in_at"
>;

export type EventStats = {
  total: number;
  byStatus: Record<RegStatus, number>;
  /** Đang giữ chỗ = chờ duyệt + đã duyệt (cùng cách tính với hàm register_for_event). */
  active: number;
  checkedIn: number;
  /** Tỷ lệ có mặt trên số đã duyệt, 0..1; null khi chưa có ai được duyệt. */
  attendanceRate: number | null;
  gender: { nam: number; nu: number; khac: number };
  ageGroups: { label: string; count: number }[];
  firstTime: number;
  lodging: number;
  topProvinces: { name: string; count: number }[];
  /** Số đăng ký theo ngày (giờ Việt Nam), tăng dần theo ngày. */
  byDay: { day: string; count: number }[];
};

const AGE_GROUPS: [string, number, number][] = [
  ["Dưới 18", 0, 17],
  ["18–30", 18, 30],
  ["31–45", 31, 45],
  ["46–60", 46, 60],
  ["Trên 60", 61, 200],
];

const vnDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

/** Chuẩn hóa tên tỉnh để "Hà Nội", " hà nội " gộp làm một. */
const provinceKey = (s: string) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");

export function computeEventStats(rows: Row[], year = new Date().getFullYear(), topN = 5): EventStats {
  const byStatus: Record<RegStatus, number> = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  const gender = { nam: 0, nu: 0, khac: 0 };
  const ages = AGE_GROUPS.map(([label]) => ({ label, count: 0 }));
  const provinces = new Map<string, { name: string; count: number }>();
  const days = new Map<string, number>();
  let checkedIn = 0;
  let firstTime = 0;
  let lodging = 0;

  for (const r of rows) {
    byStatus[r.status]++;
    days.set(vnDay(r.created_at), (days.get(vnDay(r.created_at)) ?? 0) + 1);
    if (r.checked_in_at) checkedIn++;

    // Các chỉ số về người tham dự chỉ tính đăng ký còn hiệu lực (bỏ từ chối và đã hủy).
    if (r.status !== "pending" && r.status !== "approved") continue;
    if (r.gender === "nam") gender.nam++;
    else if (r.gender === "nu") gender.nu++;
    else gender.khac++;
    if (r.is_first_time) firstTime++;
    if (r.needs_lodging) lodging++;
    if (r.birth_year) {
      const age = year - r.birth_year;
      const i = AGE_GROUPS.findIndex(([, lo, hi]) => age >= lo && age <= hi);
      if (i >= 0) ages[i].count++;
    }
    if (r.province?.trim()) {
      const key = provinceKey(r.province);
      const p = provinces.get(key) ?? { name: r.province.trim().replace(/\s+/g, " "), count: 0 };
      p.count++;
      provinces.set(key, p);
    }
  }

  return {
    total: rows.length,
    byStatus,
    active: byStatus.pending + byStatus.approved,
    checkedIn,
    attendanceRate: byStatus.approved ? checkedIn / byStatus.approved : null,
    gender,
    ageGroups: ages,
    firstTime,
    lodging,
    topProvinces: [...provinces.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "vi"))
      .slice(0, topN),
    byDay: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({ day, count })),
  };
}
