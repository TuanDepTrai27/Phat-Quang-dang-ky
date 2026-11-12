"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl">Chưa tải được dữ liệu</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Hệ thống đang gặp sự cố tạm thời. Bạn thử tải lại trang sau ít phút.
      </p>
      <button onClick={reset} className="btn btn-primary mt-6">Tải lại</button>
    </div>
  );
}
