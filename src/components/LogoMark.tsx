/** Dấu hiệu tròn vàng đồng (tự vẽ, không phải logo chính thức của thiền tôn). */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="19" fill="#7A2E1A" stroke="#F3E2B5" strokeWidth="2" />
      <circle cx="20" cy="20" r="12.5" fill="#C4952A" />
      <circle cx="20" cy="20" r="7" fill="#F6D77A" />
    </svg>
  );
}
