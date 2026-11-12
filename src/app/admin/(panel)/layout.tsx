import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <nav className="flex flex-wrap gap-5">
          <Link href="/admin" className="font-medium text-pine hover:underline">Sự kiện</Link>
          <Link href="/admin/dia-diem" className="font-medium text-pine hover:underline">Địa điểm</Link>
          <Link href="/" className="text-muted hover:text-pine">Xem trang công khai</Link>
        </nav>
        <form action={signOutAction} className="flex items-center gap-3 text-sm text-muted">
          <span>{user.email}</span>
          <button type="submit" className="btn btn-quiet btn-sm">Đăng xuất</button>
        </form>
      </div>
      {children}
    </div>
  );
}
