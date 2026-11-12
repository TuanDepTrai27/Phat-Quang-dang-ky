import { fail, fromDbError, listEvents, ok, toApiEvent, todayVN } from "@/lib/api";
import { isEventType } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/events?type=khoa_thien&upcoming=true
 * Danh sách sự kiện đã công khai, sắp theo ngày bắt đầu.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const upcoming = url.searchParams.get("upcoming");

  if (type && !isEventType(type)) {
    return fail(400, "VALIDATION_ERROR", "Tham số type không hợp lệ.", {
      type: "Một trong: khoa_thien, dai_le, quy_y, thuyet_giang, khac.",
    });
  }

  const events = await listEvents();
  if ("error" in events) return fromDbError(events.error);

  const today = todayVN();
  const data = events
    .filter((e) => !type || e.event_type === type)
    .filter((e) => upcoming !== "true" || e.end_date >= today)
    .map(toApiEvent);

  return ok(data);
}
