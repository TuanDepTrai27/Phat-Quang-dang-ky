import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { STATUS_LABEL, type Registration } from "@/lib/types";

export const dynamic = "force-dynamic";

// Chống "CSV injection": ô bắt đầu bằng = + - @ sẽ bị Excel hiểu là công thức.
const cell = (v: string | number | null | undefined) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { supabase } = await requireAdmin();

  const { data: ev } = await supabase.from("events").select("title,slug").eq("id", params.id).maybeSingle();
  if (!ev) return new Response("Không tìm thấy sự kiện", { status: 404 });

  const { data } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", params.id)
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as Registration[];

  const header = [
    "Mã", "Họ và tên", "Pháp danh", "Số điện thoại", "Năm sinh", "Giới tính",
    "Nơi ở", "Lần đầu", "Cần lưu trú", "Ghi chú", "Trạng thái", "Thời gian đăng ký", "Check-in",
  ];
  const lines = rows.map((r) =>
    [
      cell(r.code),
      cell(r.full_name),
      cell(r.dharma_name),
      `="${r.phone}"`, // giữ số 0 đầu của số điện thoại trong Excel
      cell(r.birth_year),
      cell(r.gender === "nam" ? "Nam" : r.gender === "nu" ? "Nữ" : ""),
      cell(r.province),
      cell(r.is_first_time ? "Có" : ""),
      cell(r.needs_lodging ? "Có" : ""),
      cell(r.notes),
      cell(STATUS_LABEL[r.status]),
      cell(formatDateTime(r.created_at)),
      cell(r.checked_in_at ? formatDateTime(r.checked_in_at) : ""),
    ].join(",")
  );

  const csv = "\uFEFF" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dang-ky-${ev.slug}.csv"`,
    },
  });
}
