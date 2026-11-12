import Link from "next/link";
import { DateBlock } from "./DateBlock";
import { StateBadge } from "./StateBadge";
import { eventState, formatRange, seatsText } from "@/lib/format";
import { EVENT_TYPES, type PublicEvent } from "@/lib/types";

export function EventRow({ event }: { event: PublicEvent }) {
  const state = eventState(event);
  return (
    <li>
      <Link
        href={`/su-kien/${event.slug}`}
        className="flex gap-5 border-b border-line py-6 transition-colors hover:bg-paper sm:gap-8 sm:px-3"
      >
        <DateBlock start={event.start_date} end={event.end_date} lunar={event.lunar_text} />
        <div className="min-w-0">
          <p className="text-sm text-muted">{EVENT_TYPES[event.event_type]}</p>
          <h3 className="text-xl">{event.title}</h3>
          <p className="mt-1 text-muted">{formatRange(event.start_date, event.end_date)}</p>
          {event.venue_name && <p className="text-muted">{event.venue_name}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <StateBadge state={state} />
            {state === "open" && <span className="text-sm text-muted">{seatsText(event)}</span>}
          </div>
        </div>
      </Link>
    </li>
  );
}
