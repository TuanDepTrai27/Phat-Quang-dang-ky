import Link from "next/link";
import { Enso } from "./Enso";
import { StateBadge } from "./StateBadge";
import { dayNum, eventState, formatRange, monthNum, seatsText } from "@/lib/format";
import { EVENT_TYPES, type PublicEvent } from "@/lib/types";

export function EventCard({ event }: { event: PublicEvent }) {
  const state = eventState(event);
  const meta = event.lunar_text
    ? `${EVENT_TYPES[event.event_type]} · ${event.lunar_text}`
    : [EVENT_TYPES[event.event_type], event.venue_name].filter(Boolean).join(" · ");

  return (
    <li>
      <Link
        href={`/su-kien/${event.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl bg-paper shadow-[0_2px_10px_rgba(46,26,14,0.06)] transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="relative">
          <div className="aspect-[16/9] overflow-hidden bg-pine">
            {event.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.cover_url}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-saffron to-bark text-white/40">
                <Enso className="h-24 w-24" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-6 left-4 w-16 rounded-lg border border-saffron/40 bg-mist py-1.5 text-center shadow-md">
            <p className="font-serif text-2xl font-bold leading-none text-ink">{dayNum(event.start_date)}</p>
            <p className="mt-0.5 text-[11px] text-muted">Th{monthNum(event.start_date)}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-9">
          <p className="text-[13px] font-medium text-saffron-ink">{meta}</p>
          <h3 className="mt-1 text-lg uppercase leading-snug">{event.title}</h3>
          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted">{event.description}</p>
          )}
          <div className="mt-3 space-y-0.5 text-sm text-pine-soft">
            <p>{formatRange(event.start_date, event.end_date)}</p>
            {event.venue_name && (
              <p>
                {event.venue_name}
                {state === "open" && event.capacity != null ? ` · ${seatsText(event).toLowerCase()}` : ""}
              </p>
            )}
          </div>
          <div className="min-h-[1rem] flex-1" />
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <StateBadge state={state} />
            <span className={`text-sm font-semibold ${state === "open" ? "text-saffron-ink" : "text-muted"}`}>
              {state === "open" ? "Đăng ký →" : "Xem chi tiết →"}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
