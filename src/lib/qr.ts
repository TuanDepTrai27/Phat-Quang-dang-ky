import { headers } from "next/headers";
import QRCode from "qrcode";
import { normalizeCode } from "./validation";

/** Địa chỉ gốc của trang (https://...vercel.app) lấy từ request hiện tại, để mã QR trỏ đúng tên miền đang chạy. */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Mã QR (SVG) chứa đường dẫn check-in của một đăng ký.
 * Mã QR chỉ chứa mã đăng ký, không chứa số điện thoại hay tên: ai quét được cũng chỉ mở trang check-in,
 * và trang đó đòi đăng nhập quản trị.
 */
export async function checkInQrSvg(raw: string): Promise<string | null> {
  const code = normalizeCode(raw);
  if (!code) return null;
  const url = `${await siteOrigin()}/admin/check-in?ma=${code}`;
  return QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#2E1A0E", light: "#FFFFFF" },
  });
}
