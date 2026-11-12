import { badJson, fail, fromDbError, ok, publicClient, readJson, validationFailed } from "@/lib/api";
import { validateLookup } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/registrations/cancel   Body: { code, phone }
 * 200: đã hủy (chỗ được nhả cho người khác)   404: không có đăng ký đang hiệu lực khớp mã + số điện thoại
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return badJson();

  const checked = validateLookup(body);
  if (!checked.ok) return validationFailed(checked.errors);

  const { data, error } = await publicClient().rpc("cancel_registration", {
    p_code: checked.data.code,
    p_phone: checked.data.phone,
  });
  if (error) return fromDbError(error.message);
  if (!data) {
    return fail(404, "REGISTRATION_NOT_FOUND", "Không có đăng ký đang hiệu lực khớp mã và số điện thoại này.");
  }
  return ok({ code: checked.data.code, status: "cancelled" });
}
