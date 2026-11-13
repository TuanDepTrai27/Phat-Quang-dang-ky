"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction } from "@/lib/actions";
import type { PublicEvent, RegisterFormState } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
      {pending ? "Đang gửi..." : "Gửi đăng ký"}
    </button>
  );
}

export function RegistrationForm({ event }: { event: PublicEvent }) {
  const [state, action] = useActionState<RegisterFormState, FormData>(registerAction, {});
  const v = state.values ?? {};
  const askLodging = event.event_type === "khoa_thien" || event.event_type === "dai_le";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="event_id" value={event.id} />
      <input type="hidden" name="slug" value={event.slug} />

      {/* Ô bẫy bot: người thật không nhìn thấy */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.error && (
        <div role="alert" className="rounded-md border border-lotus/40 bg-lotus/10 px-4 py-3 text-lotus">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="label">Họ và tên</label>
        <input id="full_name" name="full_name" required maxLength={100} autoComplete="name"
          defaultValue={v.full_name} className="field" />
      </div>

      <div>
        <label htmlFor="dharma_name" className="label">Pháp danh (nếu có)</label>
        <input id="dharma_name" name="dharma_name" maxLength={100}
          defaultValue={v.dharma_name} className="field" />
      </div>

      <div>
        <label htmlFor="phone" className="label">Số điện thoại</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel"
          placeholder="0912345678" defaultValue={v.phone} className="field" />
        <p className="hint">Dùng để ban tổ chức liên hệ và để bạn tra cứu đăng ký sau này.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="birth_year" className="label">Năm sinh</label>
          <input id="birth_year" name="birth_year" type="number" inputMode="numeric" required
            min={1900} max={new Date().getFullYear()} placeholder="1985"
            defaultValue={v.birth_year} className="field" />
        </div>
        <fieldset>
          <legend className="label">Giới tính</legend>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="gender" value="nam" required defaultChecked={v.gender === "nam"}
                className="h-5 w-5 accent-pine" />
              Nam
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="gender" value="nu" defaultChecked={v.gender === "nu"}
                className="h-5 w-5 accent-pine" />
              Nữ
            </label>
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor="province" className="label">Nơi ở hiện tại (tỉnh hoặc thành phố)</label>
        <input id="province" name="province" maxLength={100} autoComplete="address-level1"
          placeholder="Ví dụ: TP. Hồ Chí Minh" defaultValue={v.province} className="field" />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="is_first_time" className="mt-1 h-5 w-5 accent-pine" />
          <span>Đây là lần đầu tôi tham dự</span>
        </label>
        {askLodging && (
          <label className="flex items-start gap-3">
            <input type="checkbox" name="needs_lodging" className="mt-1 h-5 w-5 accent-pine" />
            <span>Tôi cần chỗ lưu trú</span>
          </label>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="label">Ghi chú cho ban tổ chức (không bắt buộc)</label>
        <textarea id="notes" name="notes" rows={3} maxLength={500} defaultValue={v.notes}
          placeholder="Ví dụ: sức khỏe, đi cùng người thân..." className="field" />
      </div>

      <p className="hint">
        Thông tin chỉ được ban tổ chức dùng để sắp xếp và liên hệ về sự kiện này.
      </p>

      <Submit />
    </form>
  );
}
