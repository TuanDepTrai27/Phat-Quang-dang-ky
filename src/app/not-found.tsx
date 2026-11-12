import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl">Không tìm thấy trang này</h1>
      <p className="mt-3 text-muted">Sự kiện có thể đã được gỡ hoặc đường dẫn bị sai.</p>
      <Link href="/" className="btn btn-primary mt-6">Xem các sự kiện</Link>
    </div>
  );
}
