export const EVENT_TYPES = {
  khoa_thien: "Khóa thiền",
  dai_le: "Đại lễ",
  quy_y: "Lễ quy y",
  thuyet_giang: "Thuyết giảng",
  khac: "Khác",
} as const;

export type EventType = keyof typeof EVENT_TYPES;
export const isEventType = (v: string): v is EventType => v in EVENT_TYPES;

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  event_type: EventType;
  description: string | null;
  cover_url: string | null;
  venue_name: string | null;
  venue_address: string | null;
  map_url: string | null;
  start_date: string;
  end_date: string;
  lunar_text: string | null;
  capacity: number | null;
  registration_open: boolean;
  taken: number;
};

export type Venue = {
  id: string;
  name: string;
  address: string | null;
  map_url: string | null;
};

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  event_type: EventType;
  description: string | null;
  venue_id: string | null;
  cover_url: string | null;
  start_date: string;
  end_date: string;
  lunar_text: string | null;
  capacity: number | null;
  registration_open: boolean;
  published: boolean;
};

export type RegStatus = "pending" | "approved" | "rejected" | "cancelled";

export const STATUS_LABEL: Record<RegStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

export type Registration = {
  id: string;
  code: string;
  event_id: string;
  full_name: string;
  dharma_name: string | null;
  phone: string;
  birth_year: number | null;
  gender: "nam" | "nu" | null;
  province: string | null;
  is_first_time: boolean;
  needs_lodging: boolean;
  notes: string | null;
  status: RegStatus;
  created_at: string;
};

export type LookupResult = {
  code: string;
  full_name: string;
  status: RegStatus;
  event_title: string;
  event_slug: string;
  start_date: string;
  end_date: string;
  venue_name: string | null;
};

// Trạng thái của form (dùng với useActionState)
export type RegisterFormState = {
  error?: string;
  values?: Record<string, string>;
};

export type LookupFormState = {
  error?: string;
  message?: string;
  result?: LookupResult;
  values?: { ma: string; sdt: string };
};

// Nhật ký thao tác (bảng audit_logs, migrations/003_nhat_ky_thao_tac.sql)
export type AuditLog = {
  id: number;
  at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: "event.insert" | "event.update" | "event.delete" | "registration.status" | "registration.delete";
  event_id: string | null;
  record_id: string;
  changes: Record<string, unknown> | null;
};
