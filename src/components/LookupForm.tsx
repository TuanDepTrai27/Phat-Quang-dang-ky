"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { lookupAction } from "@/lib/actions";
import { formatRange } from "@/lib/format";
import { STATUS_LABEL, type LookupFormState, type RegStatus } from "@/lib/types";

const HINT: Record<RegStatus, string> = {
  pending: "Ban tổ chức đang xem xét đăng ký của bạn.",
  approved: "Đăng ký của bạn đã được duyệt. Hẹn gặp bạn tại sự kiện.",
  rejected: "Ban tổ chức chưa thể nhận đăng ký này. Bạn vui lòng liên hệ ban tổ chức để biết thêm.",
  cancelled: "Đăng ký này đã được hủy.",
};

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
      {pending ? "Đang tìm..." : children}
    </button>
  );
}

function CancelButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="intent"
      value="cancel"
      disabled={pending}
      onClick={(e) => {
        if (!confirm("Bạn chắc chắn muốn hủy đăng ký này?")) e.preventDefault();
      }}
      className="btn btn-quiet text-lotus"
    >
      Hủy đăng ký
    </button>
  );
}

export function LookupForm({ initialCode = "" }: { initialCode?: string }) {
  const [state, action] = useActionState<LookupFormState, FormData>(lookupAction, {});
  const r = state.result;

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="ma" className="label">Mã đăng ký</label>
        <input id="ma" name="ma" required placeholder="PQ-7K3M9X" autoCapitalize="characters"
          defaultValue={state.values?.ma ?? initialCode} className="field uppercase" />
      </div>
      <div>
        <label htmlFor="sdt" className="label">Số điện thoại đã đăng ký</label>
        <input id="sdt" name="sdt" type="tel" inputMode="tel" required placeholder="0912345678"
          defaultValue={state.values?.sdt} className="field" />
      </div>

      <Submit>Tra cứu</Submit>

      {state.error && (
        <div role="alert" className="rounded-md border border-lotus/40 bg-lotus/10 px-4 py-3 text-lotus">
          {state.error}
        </div>
      )}
      {state.message && (
        <div role="status" className="rounded-md border border-pine/30 bg-pine/10 px-4 py-3 text-pine">
          {state.message}
        </div>
      )}

      {r && (
        <section className="rounded-lg border border-line bg-paper p-6" aria-live="polite">
          <p className="text-sm text-muted">Trạng thái</p>
          <p className="font-serif text-2xl font-semibold text-pine">{STATUS_LABEL[r.status]}</p>
          <p className="mt-1 text-muted">{HINT[r.status]}</p>

          <dl className="mt-5 space-y-2">
            <div><dt className="text-sm text-muted">Người đăng ký</dt><dd>{r.full_name}</dd></div>
            <div>
              <dt className="text-sm text-muted">Sự kiện</dt>
              <dd>
                <Link href={`/su-kien/${r.event_slug}`} className="text-pine underline underline-offset-4">
                  {r.event_title}
                </Link>
              </dd>
            </div>
            <div><dt className="text-sm text-muted">Thời gian</dt><dd>{formatRange(r.start_date, r.end_date)}</dd></div>
            {r.venue_name && <div><dt className="text-sm text-muted">Địa điểm</dt><dd>{r.venue_name}</dd></div>}
          </dl>

          {state.qr && (
            <div className="mt-6">
              <p className="text-sm text-muted">Mã QR check-in (đưa ban tổ chức quét khi đến sự kiện)</p>
              <div
                className="mt-2 w-44 rounded-md border border-line bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
                role="img"
                aria-label={`Mã QR check-in cho ${r.code}`}
                dangerouslySetInnerHTML={{ __html: state.qr }}
              />
            </div>
          )}

          {(r.status === "pending" || r.status === "approved") && (
            <div className="mt-6"><CancelButton /></div>
          )}
        </section>
      )}
    </form>
  );
}
