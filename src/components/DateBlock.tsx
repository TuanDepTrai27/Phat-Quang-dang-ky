import { dayNum, monthNum, yearNum } from "@/lib/format";

/** Khối "tờ lịch": ngày dương lịch lớn, ngày âm lịch ngay bên dưới. */
export function DateBlock({
  start,
  end,
  lunar,
  large = false,
  onDark = false,
}: {
  start: string;
  end: string;
  lunar: string | null;
  large?: boolean;
  onDark?: boolean;
}) {
  const multi = start !== end;
  return (
    <div className={`shrink-0 ${large ? "sm:w-44" : "w-24"} ${onDark ? "text-white" : "text-ink"}`}>
      <div
        className={`font-serif font-semibold leading-none ${large ? "text-7xl" : "text-5xl"} ${
          onDark ? "text-white" : "text-pine"
        }`}
      >
        {dayNum(start)}
      </div>
      <div className={`mt-2 text-sm ${onDark ? "text-white/80" : "text-muted"}`}>
        Tháng {monthNum(start)}, {yearNum(start)}
      </div>
      {multi && (
        <div className={`text-sm ${onDark ? "text-white/80" : "text-muted"}`}>
          đến {dayNum(end)}/{monthNum(end)}
        </div>
      )}
      {lunar && (
        <div
          className={`mt-2 text-sm font-medium ${
            onDark ? "text-saffron-light" : "text-saffron-ink"
          }`}
        >
          Âm lịch {lunar}
        </div>
      )}
    </div>
  );
}
