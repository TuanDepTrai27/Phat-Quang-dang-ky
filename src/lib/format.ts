import type { PublicEvent } from "./types";

const TZ = "Asia/Ho_Chi_Minh";

/** 'YYYY-MM-DD' -> Date (giữa trưa giờ VN để không lệch ngày) */
const parse = (s: string) => new Date(`${s}T12:00:00+07:00`);

export function todayVN(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export const dayNum = (s: string) =>
  parse(s).toLocaleDateString("vi-VN", { day: "numeric", timeZone: TZ });

export const monthNum = (s: string) =>
  parse(s).toLocaleDateString("vi-VN", { month: "numeric", timeZone: TZ });

export const yearNum = (s: string) =>
  parse(s).toLocaleDateString("vi-VN", { year: "numeric", timeZone: TZ });

export const fullDate = (s: string) =>
  parse(s).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TZ,
  });

const shortDate = (s: string) =>
  parse(s).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TZ,
  });

export function formatRange(start: string, end: string): string {
  if (start === end) return fullDate(start);
  if (monthNum(start) === monthNum(end) && yearNum(start) === yearNum(end)) {
    return `${dayNum(start)} – ${shortDate(end)}`;
  }
  return `${shortDate(start)} – ${shortDate(end)}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type EventState = "open" | "full" | "closed" | "past";

export function eventState(
  e: Pick<PublicEvent, "end_date" | "capacity" | "taken" | "registration_open">
): EventState {
  if (e.end_date < todayVN()) return "past";
  if (!e.registration_open) return "closed";
  if (e.capacity != null && e.taken >= e.capacity) return "full";
  return "open";
}

export const STATE_LABEL: Record<EventState, string> = {
  open: "Đang mở đăng ký",
  full: "Đã hết chỗ",
  closed: "Chưa mở đăng ký",
  past: "Đã diễn ra",
};

export function seatsText(e: Pick<PublicEvent, "capacity" | "taken">): string {
  if (e.capacity == null) return "Không giới hạn số lượng";
  const left = Math.max(e.capacity - e.taken, 0);
  return left > 0 ? `Còn ${left} chỗ` : "Đã hết chỗ";
}

// Chuẩn hóa dữ liệu nằm ở validation.ts (dùng chung cho form, API và kiểm thử).
export { normalizePhone, slugify } from "./validation";
