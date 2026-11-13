import { formatDateTime } from "@/lib/format";
import { STATUS_LABEL, type AuditLog, type RegStatus } from "@/lib/types";

const FIELD_LABEL: Record<string, string> = {
  title: "tên",
  event_type: "loại",
  description: "mô tả",
  venue_id: "địa điểm",
  cover_url: "ảnh bìa",
  start_date: "ngày bắt đầu",
  end_date: "ngày kết thúc",
  lunar_text: "ngày âm lịch",
  capacity: "số chỗ",
  registration_open: "mở đăng ký",
  published: "hiển thị công khai",
};

const statusText = (s: unknown) => STATUS_LABEL[s as RegStatus] ?? String(s);

function describe(log: AuditLog): string {
  const c = (log.changes ?? {}) as Record<string, unknown>;
  switch (log.action) {
    case "event.insert":
      return "Tạo sự kiện";
    case "event.delete":
      return `Xóa sự kiện "${String(c.title ?? "")}"`;
    case "event.update": {
      const fields = Object.keys(c).map((k) => FIELD_LABEL[k] ?? k);
      return `Sửa sự kiện: ${fields.join(", ")}`;
    }
    case "registration.status":
      return `${String(c.code ?? "")}: ${statusText(c.cu)} → ${statusText(c.moi)}`;
    case "registration.checkin":
      return `${String(c.code ?? "")}: Check-in tại sự kiện`;
    case "registration.delete":
      return `Xóa đăng ký ${String(c.code ?? "")}`;
    default:
      return log.action;
  }
}

/** Ai thực hiện: email admin; không đăng nhập thì phân biệt người đăng ký tự hủy với lệnh SQL chạy trực tiếp. */
function actorLabel(log: AuditLog): string {
  if (log.actor_email) return log.actor_email;
  if (log.actor_id) return "Quản trị viên";
  return log.action.startsWith("registration.") ? "Người đăng ký tự thao tác" : "Lệnh SQL trực tiếp trên CSDL";
}

export function AuditLogList({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return <p className="mt-4 text-muted">Chưa có thao tác nào được ghi lại.</p>;
  }
  return (
    <ol className="mt-4 divide-y divide-line rounded-lg border border-line bg-paper">
      {logs.map((log) => (
        <li key={log.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3">
          <span>{describe(log)}</span>
          <span className="text-sm text-muted">
            {actorLabel(log)} · {formatDateTime(log.at)}
          </span>
        </li>
      ))}
    </ol>
  );
}
