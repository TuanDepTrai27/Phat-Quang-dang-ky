import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đăng ký tu học | Thiền Tôn Phật Quang",
  description:
    "Đăng ký tham dự khóa thiền, đại lễ và các chương trình tu học tại Thiền Tôn Phật Quang.",
};

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="leading-tight">
        <span className="block font-serif text-lg font-bold uppercase tracking-wide text-white">
          Thiền Tôn Phật Quang
        </span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-saffron-light">
          Đăng ký khóa tu
        </span>
      </span>
    </span>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&display=swap&subset=vietnamese"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 bg-pine/95 text-white backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 py-3">
            <Link href="/" aria-label="Trang chủ đăng ký">
              <Brand />
            </Link>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[15px] font-medium">
              <Link href="/#su-kien" className="text-white/85 hover:text-saffron-light">Lịch tu học</Link>
              <Link href="/tra-cuu" className="text-white/85 hover:text-saffron-light">Tra cứu đăng ký</Link>
              <a
                href="https://thientonphatquang.com"
                className="hidden rounded-full border border-white/35 px-4 py-1.5 text-sm text-white hover:bg-white/10 sm:inline-block"
              >
                ← Trang chính
              </a>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:py-12">{children}</main>

        <footer className="bg-bark text-[15px] text-[#FAF7EF]/80">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Brand />
              <p className="mt-4 max-w-xs">
                Trang tiếp nhận đăng ký khóa tu, đại lễ và sự kiện của Thiền Tôn Phật Quang.
              </p>
              <div className="mt-4 flex gap-2">
                <a href="https://www.youtube.com/@phapquang.senhong" className="rounded-full border border-white/40 px-3 py-1 text-xs text-white hover:bg-white/10">YouTube</a>
                <a href="https://www.facebook.com/THIENTONPQ" className="rounded-full border border-white/40 px-3 py-1 text-xs text-white hover:bg-white/10">Facebook</a>
              </div>
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-white">Liên hệ</p>
              <p className="mt-3">Chùa Phật Quang: Núi Dinh, phường Tân Hải, TP. HCM</p>
              <p>Chùa Từ Tân: 90/153 Trường Chinh, phường Bảy Hiền</p>
              <p>+84 (254) 8376 543</p>
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-white">Liên kết</p>
              <ul className="mt-3 space-y-1">
                <li><a href="https://thientonphatquang.com" className="hover:text-saffron-light">Trang chính thientonphatquang.com</a></li>
                <li><Link href="/tra-cuu" className="hover:text-saffron-light">Tra cứu đăng ký</Link></li>
                <li><Link href="/tai-lieu-api" className="hover:text-saffron-light">Tài liệu API</Link></li>
                <li><Link href="/admin" className="hover:text-saffron-light">Quản trị</Link></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-wrap justify-between gap-2 border-t border-white/20 py-5 text-[13px] text-[#FAF7EF]/60">
              <span>© {new Date().getFullYear()} Thiền Tôn Phật Quang</span>
              <span>Ảnh: Thiền Tôn Phật Quang</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
