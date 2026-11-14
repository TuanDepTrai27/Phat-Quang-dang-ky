"use client";

import { useFormStatus } from "react-dom";

/** Nút gửi form: khóa lại và hiện "Đang xử lý..." trong lúc chờ máy chủ, tránh bấm nhiều lần. */
export function PendingButton({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className} disabled:opacity-60`}>
      {pending ? "Đang xử lý..." : children}
    </button>
  );
}
