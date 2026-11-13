import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { StateBadge } from "@/components/StateBadge";
import { getPublicEvents } from "@/lib/events";
import { dayNum, eventState, formatRange, monthNum, seatsText, todayVN, yearNum } from "@/lib/format";
import { EVENT_TYPES, isEventType } from "@/lib/types";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Chọn sự kiện",
    text: "Xem lịch khóa tu, đại lễ",
    icon: <><rect x="8" y="10" width="32" height="30" rx="3" /><path d="M8 18h32M16 6v8M32 6v8" /><circle cx="24" cy="29" r="4" /></>,
  },
  {
    title: "Điền thông tin",
    text: "Họ tên, pháp danh, số điện thoại",
    icon: <><path d="M12 6h18l8 8v28H12z" /><path d="M30 6v8h8M18 24h14M18 31h14M18 38h8" /></>,
  },
  {
    title: "Nhận mã PQ-XXXXXX",
    text: "Lưu lại để tra cứu",
    icon: <><path d="M24 40c-8-6-14-12-14-20a14 14 0 0 1 28 0c0 8-6 14-14 20z" /><path d="M24 12c-3 4-3 10 0 14 3-4 3-10 0-14zM14 22c3 4 7 5 10 4M34 22c-3 4-7 5-10 4" /></>,
  },
  {
    title: "Tra cứu, hủy",
    text: "Bằng mã và số điện thoại",
    icon: <><circle cx="21" cy="21" r="12" /><path d="M30 30l10 10M16 21l4 4 7-8" /></>,
  },
];

export default async function Home(props: { searchParams: Promise<{ loai?: string }> }) {
  const searchParams = await props.searchParams;
  const all = await getPublicEvents();
  const today = todayVN();
  const loai = searchParams.loai && isEventType(searchParams.loai) ? searchParams.loai : null;

  const next = all.find((e) => e.end_date >= today);
  const filtered = loai ? all.filter((e) => e.event_type === loai) : all;
  const upcoming = filtered.filter((e) => e.end_date >= today);
  const past = filtered.filter((e) => e.end_date < today).reverse().slice(0, 6);

  const chips = [
    { key: null, label: "Tất cả" },
    ...(["khoa_thien", "dai_le", "quy_y", "thuyet_giang"] as const).map((k) => ({ key: k, label: EVENT_TYPES[k] })),
  ];

  return (
    <>
      {/* HERO: ảnh public/images/hero.jpg, tượng Phật lệch phải, chữ bên trái */}
      <section className="hero-bg full-bleed -mt-8 overflow-hidden bg-pine text-white sm:-mt-12">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="font-serif text-lg italic text-saffron-light">Nơi tâm hồn tìm về chốn bình yên</p>
          <h1 className="mt-3 max-w-xl text-4xl !text-white sm:text-[3.4rem] sm:leading-[1.15]">Đăng ký khóa tu và sự kiện</h1>
          <p className="mt-5 max-w-lg text-white/85">
            Chọn khóa thiền hoặc đại lễ quý Phật tử muốn tham dự, điền thông tin và nhận mã đăng ký ngay trên điện thoại.
            Không cần tạo tài khoản.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#su-kien" className="btn btn-primary">Xem lịch tu học</a>
            <Link href="/tra-cuu" className="btn btn-ghost">Tra cứu đăng ký</Link>
          </div>

          {next && (
            <Link
              href={`/su-kien/${next.slug}`}
              className="mt-10 block max-w-[34rem] rounded-2xl border border-saffron-light/35 bg-pine/70 p-6 backdrop-blur transition hover:bg-pine/80"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron-light">Sự kiện sắp tới</p>
              <div className="mt-4 flex gap-5">
                <div className="shrink-0 border-r border-saffron-light/35 pr-5 text-center">
                  <p className="font-serif text-5xl font-bold leading-none">{dayNum(next.start_date)}</p>
                  <p className="mt-1 text-sm text-white/75">Th{monthNum(next.start_date)} / {yearNum(next.start_date)}</p>
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl !text-white">{next.title}</h2>
                  {next.lunar_text && <p className="text-sm text-saffron-light">Âm lịch {next.lunar_text}</p>}
                  <p className="mt-1 text-sm text-white/80">{formatRange(next.start_date, next.end_date)}</p>
                  {next.venue_name && <p className="text-sm text-white/80">{next.venue_name}</p>}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-saffron-light/25 pt-4">
                <span className="flex flex-wrap items-center gap-3">
                  <StateBadge state={eventState(next)} />
                  <span className="text-sm text-white/75">{seatsText(next)}</span>
                </span>
                <span className="text-sm font-semibold text-saffron-light">Xem chi tiết →</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* CÁC BƯỚC ĐĂNG KÝ */}
      <section className="full-bleed bg-paper">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 text-center md:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.title}>
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="mx-auto h-12 w-12 text-saffron">
                {s.icon}
              </svg>
              <p className="mt-3 font-serif text-lg font-bold">{s.title}</p>
              <p className="text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* LỊCH TU HỌC */}
      <section id="su-kien" className="full-bleed scroll-mt-16 bg-beige">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="text-center">
            <p className="eyebrow">Lịch tu học</p>
            <h2 className="mt-1 text-3xl sm:text-4xl">Khóa tu và đại lễ sắp tới</h2>
            <div className="mt-4 flex items-center justify-center gap-3 text-saffron" aria-hidden="true">
              <span className="h-px w-16 bg-saffron/60" />
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-2 3-2 7 0 10 2-3 2-7 0-10zM4 9c1 4 4 6 8 5-1-4-4-6-8-5zm16 0c-4-1-7 1-8 5 4 1 7-1 8-5zM3 16h18" />
              </svg>
              <span className="h-px w-16 bg-saffron/60" />
            </div>
          </div>

          <nav aria-label="Lọc theo loại" className="mt-8 flex flex-wrap justify-center gap-2">
            {chips.map((c) => {
              const active = c.key === loai;
              return (
                <Link
                  key={c.label}
                  href={c.key ? `/?loai=${c.key}#su-kien` : "/#su-kien"}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-[15px] transition-colors ${
                    active ? "border-pine bg-pine text-white" : "border-ink/25 bg-mist hover:border-saffron"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </nav>

          {upcoming.length > 0 ? (
            <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
            </ul>
          ) : (
            <div className="mt-10 rounded-xl bg-paper p-10 text-center">
              <p className="text-lg">Chưa có sự kiện sắp tới trong mục này.</p>
              <p className="text-muted">Quý Phật tử quay lại sau hoặc chọn mục khác.</p>
            </div>
          )}

          {past.length > 0 && (
            <details className="mt-12">
              <summary className="cursor-pointer text-center text-sm font-semibold uppercase tracking-wider text-saffron-ink hover:text-pine">
                Sự kiện đã diễn ra ({past.length}) →
              </summary>
              <ul className="mt-8 grid gap-7 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((e) => <EventCard key={e.id} event={e} />)}
              </ul>
            </details>
          )}
        </div>
      </section>

      {/* TRA CỨU NHANH: chuyển sang /tra-cuu kèm mã đã nhập */}
      <section className="pt-14">
        <div className="grid items-center gap-8 rounded-2xl border border-line bg-paper p-8 md:grid-cols-[1fr_1.1fr] md:p-11">
          <div>
            <h2 className="text-3xl">Đã đăng ký rồi?</h2>
            <p className="mt-2 text-muted">
              Nhập mã đăng ký để xem trạng thái duyệt hoặc hủy đăng ký nếu không thể tham dự.
            </p>
          </div>
          <form action="/tra-cuu" method="get" className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="ma-nhanh" className="sr-only">Mã đăng ký</label>
            <input id="ma-nhanh" name="ma" required maxLength={12} placeholder="Mã đăng ký (PQ-XXXXXX)" className="field bg-mist uppercase" />
            <button type="submit" className="btn btn-primary shrink-0">Tra cứu</button>
          </form>
        </div>
      </section>
    </>
  );
}
