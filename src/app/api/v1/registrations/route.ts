import { badJson, fromDbError, ok, publicClient, readJson, validationFailed } from "@/lib/api";
import { validateRegistration } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/registrations
 * Body JSON: { event_id, full_name, phone, birth_year, gender, dharma_name?, province?,
 *              is_first_time?, needs_lodging?, notes? }
 * 201: { data: { code } }   400: dữ liệu sai   404: không có sự kiện   409: hết chỗ / đã đăng ký / đã đóng
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badJson();

  const checked = validateRegistration(body);
  if (!checked.ok) return validationFailed(checked.errors);
  const d = checked.data;

  // Kiểm tra chỗ trống, trùng đăng ký và khóa dòng nằm trong hàm Postgres register_for_event
  const { data, error } = await publicClient().rpc("register_for_event", {
    p_event: d.eventId,
    p_full_name: d.fullName,
    p_dharma_name: d.dharmaName,
    p_phone: d.phone,
    p_birth_year: d.birthYear,
    p_gender: d.gender,
    p_province: d.province,
    p_is_first_time: d.isFirstTime,
    p_needs_lodging: d.needsLodging,
    p_notes: d.notes,
  });
  if (error) return fromDbError(error.message);

  return ok({ code: String(data), event_id: d.eventId }, 201);
}
