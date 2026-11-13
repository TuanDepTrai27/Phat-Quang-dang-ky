import Link from "next/link";
import { checkInAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatRange } from "@/lib/format";
import { STATUS_LABEL, type EventRow, type Registration } from "@/lib/types";
import { normalizeCode } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Tình nguyện viên quét QR mà chưa đăng nhập: middleware chuyển sang /admin/login?tiep=...,
// đăng nhập xong quay lại đúng mã vừa quét.
export default async function CheckInPage(props: {
  searchParams: Promise<{ ma?: string; ok?: string; loi?: string }>;
}) {
  const sp = await props.searchParams;
  const raw = (sp.ma ?? "").slice(0, 20);
  const code = raw ? normalizeCode(raw) : null;
  const { supabase } = await requireAdmin();

  let reg: Registration | null = null;
  let event: Pick<EventRow, "id" | "title" | "start_date" | "end_date"> | null = null;
  if (code) {
    const { data } = await supabase.from("registrations").select("*").eq("code", code).maybeSingle();
    reg = data as Registration | null;
    if (reg) {
      const { data: ev } = await supabase
        .from("events")
        .select("id,title,start_date,end_date")
        .eq("id", reg.event_id)
        .maybeSingle();
      event = ev;
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl">Check-in tại sự kiện</h1>
      <p className="mt-2 text-muted">
        Quét mã QR của người tham dự bằng camera điện thoại (trang này sẽ tự mở), hoặc nhập mã đăng ký.
      </p>

      <form method="get" className="mt-6 flex gap-3">
        <label htmlFor="ma" className="sr-only">Mã đăng ký</label>
        <input id="ma" name="ma" defaultValue={code ?? raw} placeholder="PQ-7K3M9X" autoCapitalize="characters"
          required className="field uppercase" />
        <button type="submit" className="btn btn-primary">Tìm</button>
      </form>

      {sp.ok && reg?.checked_in_at && (
        <div role="status" className="mt-6 rounded-md border border-pine/30 bg-pine/10 px-4 py-3 text-lg text-pine">
          Đã check-in {reg.full_name} lúc {formatDateTime(reg.checked_in_at)}.
        </div>
      )}
      {sp.loi && (
        <div role="alert" className="mt-6 rounded-md border border-lotus/40 bg-lotus/10 px-4 py-3 text-lotus">
          {sp.loi}
        </div>
      )}

      {raw && !code && (
        <p role="alert" className="mt-6 text-lotus">Mã không đúng dạng PQ-XXXXXX.</p>
      )}
      {code && !reg && (
        <p role="alert" className="mt-6 text-lotus">Không tìm thấy đăng ký có mã {code}.</p>
      )}

      {reg && (
        <section className="mt-6 rounded-lg border border-line bg-paper p-6">
          <p className="text-sm text-muted">{reg.code}</p>
          <p className="font-serif text-2xl font-semibold">{reg.full_name}</p>
          {reg.dharma_name && <p className="text-muted">Pháp danh: {reg.dharma_name}</p>}
          <dl className="mt-4 space-y-2">
            {event && (
              <div>
                <dt className="text-sm text-muted">Sự kiện</dt>
                <dd>
                  <Link href={`/admin/su-kien/${event.id}`} className="text-pine underline underline-offset-4">
                    {event.title}
                  </Link>{" "}
                  <span className="text-muted">({formatRange(event.start_date, event.end_date)})</span>
                </dd>
              </div>
            )}
            <div><dt className="text-sm text-muted">Số điện thoại</dt><dd>{reg.phone}</dd></div>
            <div><dt className="text-sm text-muted">Trạng thái</dt><dd>{STATUS_LABEL[reg.status]}</dd></div>
            {reg.needs_lodging && <div><dt className="text-sm text-muted">Lưu trú</dt><dd>Cần chỗ lưu trú</dd></div>}
          </dl>

          {reg.checked_in_at ? (
            <p className="mt-6 rounded-md bg-pine/10 px-4 py-3 text-pine">
              Đã check-in lúc {formatDateTime(reg.checked_in_at)}.
            </p>
          ) : reg.status === "approved" || reg.status === "pending" ? (
            <form action={checkInAction} className="mt-6 flex flex-wrap gap-3">
              <input type="hidden" name="ma" value={reg.code} />
              {reg.status === "approved" ? (
                <button type="submit" className="btn btn-primary">Check-in</button>
              ) : (
                <button type="submit" name="duyet" value="1" className="btn btn-primary">Duyệt và check-in</button>
              )}
            </form>
          ) : (
            <p className="mt-6 rounded-md bg-lotus/10 px-4 py-3 text-lotus">
              Đăng ký đã {STATUS_LABEL[reg.status].toLowerCase()}, không check-in được.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
