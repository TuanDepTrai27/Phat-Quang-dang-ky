import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatRange } from "@/lib/format";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  capacity: number | null;
  published: boolean;
  registration_open: boolean;
  registrations: { status: string }[];
};

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("events")
    .select("id,title,start_date,end_date,capacity,published,registration_open,registrations(status)")
    .order("start_date", { ascending: false });
  const events = (data ?? []) as unknown as Row[];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">Sự kiện</h1>
        <Link href="/admin/su-kien/moi" className="btn btn-primary">Thêm sự kiện</Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line bg-paper p-8 text-center text-muted">
          Chưa có sự kiện nào. Bấm &quot;Thêm sự kiện&quot; để bắt đầu.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {events.map((e) => {
            const pending = e.registrations.filter((r) => r.status === "pending").length;
            const approved = e.registrations.filter((r) => r.status === "approved").length;
            return (
              <li key={e.id}>
                <Link href={`/admin/su-kien/${e.id}`} className="flex flex-wrap items-center justify-between gap-4 py-4 hover:bg-paper sm:px-3">
                  <div>
                    <p className="text-lg font-medium">{e.title}</p>
                    <p className="text-sm text-muted">{formatRange(e.start_date, e.end_date)}</p>
                    <p className="mt-1 text-sm">
                      <span className={e.published ? "text-pine" : "text-muted"}>
                        {e.published ? "Đã đăng" : "Bản nháp"}
                      </span>
                      <span className="ml-3 text-muted">
                        {e.registration_open ? "Đang mở đăng ký" : "Đã đóng đăng ký"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="font-serif text-2xl text-saffron-ink">{pending}</p>
                      <p className="text-sm text-muted">Chờ duyệt</p>
                    </div>
                    <div>
                      <p className="font-serif text-2xl text-pine">
                        {approved}
                        {e.capacity ? <span className="text-base text-muted">/{e.capacity}</span> : null}
                      </p>
                      <p className="text-sm text-muted">Đã duyệt</p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
