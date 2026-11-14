import Link from "next/link";
import { notFound } from "next/navigation";
import { AuditLogList } from "@/components/AuditLogList";
import { EventForm } from "@/components/EventForm";
import { EventStats } from "@/components/EventStats";
import { PendingButton } from "@/components/PendingButton";
import { checkInAction, setRegistrationStatusAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, formatRange } from "@/lib/format";
import { computeEventStats } from "@/lib/stats";
import { STATUS_LABEL, type AuditLog, type EventRow, type RegStatus, type Registration, type Venue } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<RegStatus, string> = {
  pending: "bg-saffron-light/40 text-saffron-ink",
  approved: "bg-pine/10 text-pine",
  rejected: "bg-lotus/10 text-lotus",
  cancelled: "bg-line/60 text-muted",
};

function StatusForm({ r, to, label }: { r: Registration; to: RegStatus; label: string }) {
  return (
    <form action={setRegistrationStatusAction}>
      <input type="hidden" name="id" value={r.id} />
      <input type="hidden" name="event_id" value={r.event_id} />
      <input type="hidden" name="status" value={to} />
      <PendingButton className="btn btn-quiet btn-sm whitespace-nowrap">{label}</PendingButton>
    </form>
  );
}

export default async function AdminEventPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tt?: string; q?: string; loi?: string; "da-luu"?: string }>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const { supabase } = await requireAdmin();

  const [evRes, venueRes, regRes, logRes] = await Promise.all([
    supabase.from("events").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("venues").select("*").order("name"),
    supabase.from("registrations").select("*").eq("event_id", params.id).order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").eq("event_id", params.id).order("at", { ascending: false }).limit(30),
  ]);
  const event = evRes.data as EventRow | null;
  if (!event) notFound();

  const venues = (venueRes.data ?? []) as Venue[];
  const all = (regRes.data ?? []) as Registration[];
  // logRes.error khi chưa chạy migrations/003_nhat_ky_thao_tac.sql
  const logs = logRes.error ? null : ((logRes.data ?? []) as AuditLog[]);

  const count = (s: RegStatus) => all.filter((r) => r.status === s).length;
  const taken = count("pending") + count("approved");
  const stats = computeEventStats(all);

  const tt = searchParams.tt ?? "";
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const list = all.filter(
    (r) =>
      (!tt || r.status === tt) &&
      (!q ||
        r.full_name.toLowerCase().includes(q) ||
        (r.dharma_name ?? "").toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.code.toLowerCase().includes(q))
  );

  return (
    <>
      <Link href="/admin" className="text-muted hover:text-pine">Tất cả sự kiện</Link>
      <h1 className="mt-3 text-3xl">{event.title}</h1>
      <p className="text-muted">{formatRange(event.start_date, event.end_date)}</p>

      {searchParams["da-luu"] && (
        <div role="status" className="mt-4 rounded-md border border-pine/30 bg-pine/10 px-4 py-3 text-pine">
          Đã lưu sự kiện.
        </div>
      )}
      {searchParams.loi && (
        <div role="alert" className="mt-4 rounded-md border border-lotus/40 bg-lotus/10 px-4 py-3 text-lotus">
          {searchParams.loi}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Chờ duyệt", count("pending")],
          ["Đã duyệt", count("approved")],
          ["Đã check-in", stats.checkedIn],
          [event.capacity ? "Chỗ còn lại" : "Số chỗ", event.capacity ? Math.max(event.capacity - taken, 0) : "Không giới hạn"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-line bg-paper p-4">
            <p className="font-serif text-2xl text-pine">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl">Danh sách đăng ký ({list.length})</h2>
          <a href={`/admin/su-kien/${event.id}/export`} className="btn btn-quiet btn-sm">
            Tải danh sách (CSV, mở được bằng Excel)
          </a>
        </div>

        <form method="get" className="mt-4 flex flex-wrap gap-3">
          <input name="q" defaultValue={searchParams.q} placeholder="Tìm tên, pháp danh, số điện thoại, mã" className="field max-w-xs" />
          <select name="tt" defaultValue={tt} className="field w-auto">
            <option value="">Mọi trạng thái</option>
            {(Object.keys(STATUS_LABEL) as RegStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-quiet">Lọc</button>
        </form>

        {list.length === 0 ? (
          <p className="mt-6 rounded-lg border border-line bg-paper p-8 text-center text-muted">
            {all.length === 0 ? "Chưa có ai đăng ký sự kiện này." : "Không có đăng ký nào khớp bộ lọc."}
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
            <table className="w-full min-w-[820px] text-left text-base">
              <thead className="border-b border-line text-sm text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Người đăng ký</th>
                  <th className="px-4 py-3 font-medium">Liên hệ</th>
                  <th className="px-4 py-3 font-medium">Thông tin</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.full_name}</p>
                      {r.dharma_name && <p className="text-sm text-muted">Pháp danh: {r.dharma_name}</p>}
                      <p className="text-sm text-muted">{r.code}</p>
                      <p className="text-xs text-muted">{formatDateTime(r.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${r.phone}`} className="text-pine underline underline-offset-4">{r.phone}</a>
                      {r.province && <p className="text-sm text-muted">{r.province}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p>
                        {r.gender === "nam" ? "Nam" : r.gender === "nu" ? "Nữ" : ""}
                        {r.birth_year ? `, sinh ${r.birth_year}` : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.is_first_time && <span className="rounded bg-saffron-light/40 px-2 py-0.5 text-xs text-saffron-ink">Lần đầu</span>}
                        {r.needs_lodging && <span className="rounded bg-pine/10 px-2 py-0.5 text-xs text-pine">Cần lưu trú</span>}
                      </div>
                      {r.notes && <p className="mt-1 max-w-[16rem] text-muted">{r.notes}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-0.5 text-sm font-medium ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                      {r.checked_in_at && (
                        <p className="mt-1 text-xs text-pine">Check-in {formatDateTime(r.checked_in_at)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.checked_in_at ? (
                        <span className="text-sm text-muted">Đã có mặt</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {r.status === "approved" && (
                            <form action={checkInAction}>
                              <input type="hidden" name="ma" value={r.code} />
                              <input type="hidden" name="event_id" value={r.event_id} />
                              <input type="hidden" name="tu" value="su-kien" />
                              <PendingButton className="btn btn-primary btn-sm whitespace-nowrap">Check-in</PendingButton>
                            </form>
                          )}
                          {r.status !== "approved" && r.status !== "cancelled" && <StatusForm r={r} to="approved" label="Duyệt" />}
                          {r.status === "pending" && <StatusForm r={r} to="rejected" label="Từ chối" />}
                          {(r.status === "approved" || r.status === "rejected") && <StatusForm r={r} to="pending" label="Về chờ duyệt" />}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Thống kê</h2>
        <p className="text-sm text-muted">
          Giới tính, độ tuổi, nơi ở chỉ tính đăng ký đang chờ duyệt hoặc đã duyệt.
        </p>
        <EventStats s={stats} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Nhật ký thao tác</h2>
        <p className="text-sm text-muted">30 thao tác gần nhất, ghi tự động bằng trigger trong cơ sở dữ liệu.</p>
        {logs ? (
          <AuditLogList logs={logs} />
        ) : (
          <p className="mt-4 text-muted">Chưa bật nhật ký: chạy supabase/migrations/003_nhat_ky_thao_tac.sql.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Thông tin sự kiện</h2>
        <div className="mt-6">
          <EventForm event={event} venues={venues} />
        </div>
      </section>
    </>
  );
}
