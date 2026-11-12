import { STATE_LABEL, type EventState } from "@/lib/format";

const STYLE: Record<EventState, string> = {
  open: "bg-[#E8F0DE] text-leaf",
  full: "bg-[#F1DCD5] text-lotus",
  closed: "bg-[#F3E6C6] text-saffron-ink",
  past: "bg-line/70 text-muted",
};

/** Nhãn trạng thái sự kiện. Màu nền sáng nên đọc được trên cả nền tối lẫn nền sáng. */
export function StateBadge({ state }: { state: EventState; onDark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[13px] font-semibold ${STYLE[state]}`}>
      {state === "open" && <span className="h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden="true" />}
      {STATE_LABEL[state]}
    </span>
  );
}
