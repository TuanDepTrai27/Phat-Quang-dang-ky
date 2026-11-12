/**
 * Kiểm tra và chuẩn hóa dữ liệu đầu vào, dùng chung cho form (server action) và REST API.
 * File này KHÔNG import thư viện hay file khác để chạy được kiểm thử bằng `node --test`.
 */

export type FieldErrors = Record<string, string>;
export type Result<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

export type RegistrationInput = {
  eventId: string;
  fullName: string;
  dharmaName: string;
  phone: string;
  birthYear: number;
  gender: "nam" | "nu";
  province: string;
  isFirstTime: boolean;
  needsLodging: boolean;
  notes: string;
};

export type LookupInput = { code: string; phone: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE_RE = /^PQ-[A-Z0-9]{6}$/;

/** Chuẩn hóa số điện thoại VN về dạng 0xxxxxxxxx. Trả về null nếu sai. */
export function normalizePhone(raw: string): string | null {
  let p = raw.replace(/[\s.\-()]/g, "");
  if (p.startsWith("+84")) p = "0" + p.slice(3);
  else if (p.startsWith("84") && p.length === 11) p = "0" + p.slice(2);
  return /^0\d{9}$/.test(p) ? p : null;
}

/** Chuẩn hóa mã đăng ký: bỏ khoảng trắng, viết hoa. Trả về null nếu sai định dạng PQ-XXXXXX. */
export function normalizeCode(raw: string): string | null {
  const c = raw.trim().toUpperCase();
  return CODE_RE.test(c) ? c : null;
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

/** Ô tick từ form gửi "on", từ API gửi true/false. */
const bool = (v: unknown): boolean => v === true || v === "on" || v === "true";

/** Kiểm tra dữ liệu đăng ký. Tên trường theo dạng snake_case (giống form và API). */
export function validateRegistration(
  raw: Record<string, unknown>,
  now: Date = new Date()
): Result<RegistrationInput> {
  const errors: FieldErrors = {};

  const eventId = str(raw.event_id);
  if (!UUID_RE.test(eventId)) errors.event_id = "Mã sự kiện không hợp lệ.";

  const fullName = str(raw.full_name).replace(/\s+/g, " ");
  if (fullName.length < 2 || fullName.length > 100) errors.full_name = "Vui lòng nhập họ và tên.";

  const phone = normalizePhone(str(raw.phone));
  if (!phone) errors.phone = "Số điện thoại chưa đúng. Ví dụ: 0912345678.";

  const birthYearText = str(raw.birth_year);
  const birthYear = /^\d{4}$/.test(birthYearText) ? Number(birthYearText) : NaN;
  if (!(birthYear >= 1900 && birthYear <= now.getFullYear())) errors.birth_year = "Năm sinh chưa đúng. Ví dụ: 1985.";

  const gender = str(raw.gender);
  if (gender !== "nam" && gender !== "nu") errors.gender = "Vui lòng chọn giới tính.";

  const dharmaName = str(raw.dharma_name);
  if (dharmaName.length > 100) errors.dharma_name = "Pháp danh tối đa 100 ký tự.";

  const province = str(raw.province);
  if (province.length > 100) errors.province = "Tỉnh/thành tối đa 100 ký tự.";

  const notes = str(raw.notes);
  if (notes.length > 500) errors.notes = "Ghi chú tối đa 500 ký tự.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      eventId,
      fullName,
      dharmaName,
      phone: phone as string,
      birthYear,
      gender: gender as "nam" | "nu",
      province,
      isFirstTime: bool(raw.is_first_time),
      needsLodging: bool(raw.needs_lodging),
      notes,
    },
  };
}

/** Kiểm tra mã đăng ký + số điện thoại (tra cứu, hủy). */
export function validateLookup(raw: Record<string, unknown>): Result<LookupInput> {
  const errors: FieldErrors = {};
  const code = normalizeCode(str(raw.code));
  if (!code) errors.code = "Mã đăng ký có dạng PQ-XXXXXX.";
  const phone = normalizePhone(str(raw.phone));
  if (!phone) errors.phone = "Số điện thoại chưa đúng. Ví dụ: 0912345678.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { code: code as string, phone: phone as string } };
}

/* ------------------------------------------------------------------ */
/* Lỗi nghiệp vụ do hàm Postgres ném ra (raise exception 'EVENT_FULL'…) */
/* ------------------------------------------------------------------ */

export const DB_ERRORS = {
  INVALID_INPUT: { status: 400, message: "Thông tin chưa hợp lệ. Quý Phật tử kiểm tra lại họ tên và số điện thoại." },
  EVENT_NOT_FOUND: { status: 404, message: "Không tìm thấy sự kiện này." },
  REGISTRATION_CLOSED: { status: 409, message: "Sự kiện này chưa mở hoặc đã đóng đăng ký." },
  ALREADY_REGISTERED: {
    status: 409,
    message: "Họ tên và số điện thoại này đã đăng ký sự kiện. Quý Phật tử có thể tra cứu lại bằng mã đăng ký.",
  },
  EVENT_FULL: { status: 409, message: "Sự kiện đã hết chỗ. Quý Phật tử vui lòng liên hệ ban tổ chức để được hỗ trợ." },
} as const;

export type DbErrorCode = keyof typeof DB_ERRORS;

/** Tìm mã lỗi nghiệp vụ trong thông báo lỗi của Postgres. Không thấy thì trả về null. */
export function dbErrorCode(message: string | undefined | null): DbErrorCode | null {
  if (!message) return null;
  const key = (Object.keys(DB_ERRORS) as DbErrorCode[]).find((k) => message.includes(k));
  return key ?? null;
}
