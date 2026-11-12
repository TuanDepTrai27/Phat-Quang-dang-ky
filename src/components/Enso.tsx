/** Vòng tròn Nhất viên tướng (ensō): họa tiết trang trí, kế thừa màu chữ. */
export function Enso({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path d="M76 22 A38 38 0 1 0 88 54" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
