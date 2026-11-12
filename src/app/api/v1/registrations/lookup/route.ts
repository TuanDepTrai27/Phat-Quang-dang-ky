import { badJson, fail, fromDbError, ok, publicClient, readJson, validationFailed } from "@/lib/api";
import { STATUS_LABEL, type LookupResult } from "@/lib/types";
import { validateLookup } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/registrations/lookup   Body: { code, phone }
 * Dùng POST (không dùng GET) để số điện thoại không nằm trong URL và nhật ký truy cập.
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badJson();

  const checked = validateLookup(body);
  if (!checked.ok) return validationFailed(checked.errors);

  const { data, error } = await publicClient().rpc("lookup_registration", {
    p_code: checked.data.code,
    p_phone: checked.data.phone,
  });
  if (error) return fromDbError(error.message);

  const row = ((data ?? []) as LookupResult[])[0];
  if (!row) return fail(404, "REGISTRATION_NOT_FOUND", "Không tìm thấy đăng ký với mã và số điện thoại này.");

  return ok({
    code: row.code,
    full_name: row.full_name,
    status: row.status,
    status_label: STATUS_LABEL[row.status],
    event: {
      title: row.event_title,
      slug: row.event_slug,
      start_date: row.start_date,
      end_date: row.end_date,
      venue_name: row.venue_name,
    },
  });
}
