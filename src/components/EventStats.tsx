import type { EventStats as Stats } from "@/lib/stats";

function Bars({ items, total }: { items: { label: string; count: number }[]; total: number }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.label} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate">{it.label}</span>
          <span className="h-2.5 rounded-full bg-line/60">
            <span
              className="block h-2.5 rounded-full bg-pine"
              style={{ width: total ? `${Math.round((it.count / total) * 100)}%` : 0 }}
            />
          </span>
          <span className="text-right tabular-nums text-muted">{it.count}</span>
        </li>
      ))}
    </ul>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-5">
      <h3 className="mb-4 text-lg">{title}</h3>
      {children}
    </div>
  );
}

const shortDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

export function EventStats({ s }: { s: Stats }) {
  if (s.total === 0) return <p className="mt-4 text-muted">Chưa có số liệu vì chưa có ai đăng ký.</p>;
  const maxDay = Math.max(...s.byDay.map((d) => d.count));
  const known = s.ageGroups.reduce((n, a) => n + a.count, 0);
  const provTotal = s.topProvinces[0]?.count ?? 0;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Card title="Có mặt tại sự kiện">
        <p className="font-serif text-3xl text-pine">
          {s.checkedIn}
          <span className="text-lg text-muted"> / {s.byStatus.approved} đã duyệt</span>
        </p>
        {s.attendanceRate !== null && (
          <p className="mt-1 text-muted">Tỷ lệ có mặt {Math.round(s.attendanceRate * 100)}%</p>
        )}
        <p className="mt-3 text-sm text-muted">
          Lần đầu tham dự: {s.firstTime} · Cần lưu trú: {s.lodging}
        </p>
      </Card>

      <Card title="Giới tính (đăng ký còn hiệu lực)">
        <Bars
          total={s.active}
          items={[
            { label: "Nam", count: s.gender.nam },
            { label: "Nữ", count: s.gender.nu },
            { label: "Không ghi", count: s.gender.khac },
          ]}
        />
      </Card>

      <Card title="Độ tuổi">
        {known ? <Bars total={known} items={s.ageGroups} /> : <p className="text-muted">Chưa ai ghi năm sinh.</p>}
      </Card>

      <Card title="Nơi ở nhiều nhất">
        {s.topProvinces.length ? (
          <Bars total={provTotal} items={s.topProvinces.map((p) => ({ label: p.name, count: p.count }))} />
        ) : (
          <p className="text-muted">Chưa ai ghi nơi ở.</p>
        )}
      </Card>

      <div className="md:col-span-2">
        <Card title="Số đăng ký theo ngày">
          <div className="flex h-32 items-end gap-1 overflow-x-auto" role="img"
            aria-label={s.byDay.map((d) => `${shortDay(d.day)}: ${d.count}`).join(", ")}>
            {s.byDay.map((d) => (
              <div key={d.day} className="flex min-w-[2.25rem] flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs tabular-nums text-muted">{d.count}</span>
                <span className="w-full rounded-t bg-saffron" style={{ height: `${(d.count / maxDay) * 80}px` }} />
                <span className="text-xs text-muted">{shortDay(d.day)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
