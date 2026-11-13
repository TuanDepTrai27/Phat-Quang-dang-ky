import Link from "next/link";
import { notFound } from "next/navigation";
import { StateBadge } from "@/components/StateBadge";
import { getPublicEvent } from "@/lib/events";
import { dayNum, eventState, formatRange, monthNum, seatsText, yearNum } from "@/lib/format";
import { EVENT_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  const state = eventState(event);

  const bg = event.cover_url
    ? `linear-gradient(90deg, rgba(30,17,8,.92) 0%, rgba(30,17,8,.7) 50%, rgba(30,17,8,.35) 100%), url("${event.cover_url.replace(/"/g, "%22")}")`
    : undefined;

  return (
    <article>
      {/* Banner: ảnh bìa sự kiện, phủ tối để chữ dễ đọc */}
      <header
        className="full-bleed -mt-8 bg-pine bg-cover bg-center text-white sm:-mt-12"
        style={bg ? { backgroundImage: bg } : undefined}
      >
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:pb-16">
          <Link href="/#su-kien" className="text-sm text-white/75 hover:text-saffron-light">
            ← Lịch tu học
          </Link>
          <div className="mt-10 flex items-end gap-6">
            <div className="shrink-0 rounded-xl border border-saffron-light/40 bg-pine/60 px-4 py-3 text-center backdrop-blur">
              <p className="font-serif text-5xl font-bold leading-none">{dayNum(event.start_date)}</p>
              <p className="mt-1 text-sm text-white/75">Th{monthNum(event.start_date)} / {yearNum(event.start_date)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-saffron-light">
                {EVENT_TYPES[event.event_type]}
                {event.lunar_text ? ` · Âm lịch ${event.lunar_text}` : ""}
              </p>
              <h1 className="mt-1 text-3xl !text-white sm:text-5xl">{event.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <dl className="grid gap-5 rounded-xl border border-line bg-paper p-6 sm:grid-cols-3">
            <div>
              <dt className="eyebrow !text-xs">Thời gian</dt>
              <dd className="mt-1">{formatRange(event.start_date, event.end_date)}</dd>
            </div>
            <div>
              <dt className="eyebrow !text-xs">Địa điểm</dt>
              <dd className="mt-1">
                {event.venue_name ?? "Đang cập nhật"}
                {event.venue_address && <span className="block text-sm text-muted">{event.venue_address}</span>}
                {event.map_url && (
                  <a
                    href={event.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-saffron-ink underline underline-offset-4"
                  >
                    Xem bản đồ
                  </a>
                )}
              </dd>
            </div>
            <div>
              <dt className="eyebrow !text-xs">Số lượng</dt>
              <dd className="mt-1">{seatsText(event)}</dd>
            </div>
          </dl>

          {event.description && (
            <section className="mt-10">
              <h2 className="text-2xl">Chương trình</h2>
              <div className="mt-3 h-px w-16 bg-saffron" aria-hidden="true" />
              <p className="mt-4 whitespace-pre-line text-[1.0625rem]">{event.description}</p>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-saffron/40 bg-paper p-6 shadow-[0_2px_10px_rgba(46,26,14,0.06)]">
            <StateBadge state={state} />
            {state === "open" ? (
              <>
                <p className="mt-3">
                  Điền thông tin trong khoảng 2 phút. Quý Phật tử sẽ nhận mã đăng ký để tra cứu hoặc hủy khi cần.
                </p>
                <Link href={`/su-kien/${event.slug}/dang-ky`} className="btn btn-primary mt-5 w-full">
                  Đăng ký tham dự
                </Link>
              </>
            ) : (
              <p className="mt-3 text-muted">
                {state === "full" && "Sự kiện đã đủ số lượng. Quý Phật tử liên hệ ban tổ chức nếu cần hỗ trợ thêm."}
                {state === "closed" && "Sự kiện chưa mở hoặc đã ngưng nhận đăng ký. Quý Phật tử vui lòng theo dõi thông báo."}
                {state === "past" && "Sự kiện này đã diễn ra."}
              </p>
            )}
            <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
              Đã đăng ký?{" "}
              <Link href="/tra-cuu" className="font-semibold text-saffron-ink hover:underline">
                Tra cứu tại đây
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
