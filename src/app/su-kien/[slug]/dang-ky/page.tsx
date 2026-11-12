import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getPublicEvent } from "@/lib/events";
import { eventState, formatRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ params }: { params: { slug: string } }) {
  const event = await getPublicEvent(params.slug);
  if (!event) notFound();
  const state = eventState(event);

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/su-kien/${event.slug}`} className="text-muted hover:text-pine">
        Quay lại chi tiết sự kiện
      </Link>
      <h1 className="mt-4 text-3xl">Đăng ký: {event.title}</h1>
      <p className="mt-2 text-muted">
        {formatRange(event.start_date, event.end_date)}
        {event.venue_name ? `, ${event.venue_name}` : ""}
      </p>

      <div className="mt-8">
        {state === "open" ? (
          <RegistrationForm event={event} />
        ) : (
          <div className="rounded-lg border border-line bg-paper p-6">
            <p className="text-lg">
              {state === "full" && "Sự kiện đã hết chỗ."}
              {state === "closed" && "Sự kiện đã đóng đăng ký."}
              {state === "past" && "Sự kiện đã diễn ra."}
            </p>
            <Link href="/" className="btn btn-primary mt-4">Xem sự kiện khác</Link>
          </div>
        )}
      </div>
    </div>
  );
}
