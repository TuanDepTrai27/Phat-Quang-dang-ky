import { fail, fromDbError, listEvents, ok, toApiEvent } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/v1/events/{slug}: chi tiết một sự kiện đã công khai. */
export async function GET(_req: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const events = await listEvents();
  if ("error" in events) return fromDbError(events.error);

  const event = events.find((e) => e.slug === params.slug);
  if (!event) return fail(404, "EVENT_NOT_FOUND", "Không tìm thấy sự kiện này.");
  return ok(toApiEvent(event));
}
