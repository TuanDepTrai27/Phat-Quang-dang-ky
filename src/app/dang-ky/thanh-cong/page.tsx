import Link from "next/link";
import { getPublicEvent } from "@/lib/events";
import { formatRange } from "@/lib/format";
import { checkInQrSvg } from "@/lib/qr";

export const dynamic = "force-dynamic";

export default async function SuccessPage(props: {
  searchParams: Promise<{ ma?: string; "su-kien"?: string }>;
}) {
  const searchParams = await props.searchParams;
  const code = (searchParams.ma ?? "").slice(0, 12);
  const slug = searchParams["su-kien"] ?? "";
  const [event, qr] = await Promise.all([slug ? getPublicEvent(slug) : null, checkInQrSvg(code)]);

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl">Đã nhận đăng ký của bạn</h1>
      {event && (
        <p className="mt-3 text-muted">
          {event.title}, {formatRange(event.start_date, event.end_date)}
        </p>
      )}

      <div className="mt-8 rounded-lg border border-line bg-paper px-6 py-8">
        <p className="text-sm text-muted">Mã đăng ký của bạn</p>
        <p className="mt-2 font-serif text-4xl font-semibold tracking-widest text-pine">{code}</p>
        {qr && (
          <div
            className="mx-auto mt-6 w-48 rounded-md border border-line bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
            role="img"
            aria-label={`Mã QR check-in cho ${code}`}
            dangerouslySetInnerHTML={{ __html: qr }}
          />
        )}
        <p className="mt-4 text-muted">
          Hãy chụp màn hình trang này. Khi đến sự kiện, đưa mã QR cho ban tổ chức quét để check-in
          (dùng được khi đăng ký đã được duyệt). Bạn cần mã cùng số điện thoại để tra cứu hoặc hủy đăng ký.
        </p>
      </div>

      <p className="mt-6">
        Ban tổ chức sẽ duyệt đăng ký và liên hệ qua số điện thoại bạn đã cung cấp khi cần.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/tra-cuu" className="btn btn-primary">Tra cứu đăng ký</Link>
        <Link href="/" className="btn btn-quiet">Về trang sự kiện</Link>
      </div>
    </div>
  );
}
