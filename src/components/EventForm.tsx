import { saveEventAction } from "@/lib/actions";
import { EVENT_TYPES, type EventRow, type Venue } from "@/lib/types";

export function EventForm({ event, venues }: { event?: EventRow; venues: Venue[] }) {
  return (
    <form action={saveEventAction} className="max-w-2xl space-y-5">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div>
        <label htmlFor="title" className="label">Tên sự kiện</label>
        <input id="title" name="title" required defaultValue={event?.title} className="field" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="event_type" className="label">Loại</label>
          <select id="event_type" name="event_type" defaultValue={event?.event_type ?? "khoa_thien"} className="field">
            {Object.entries(EVENT_TYPES).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="venue_id" className="label">Địa điểm</label>
          <select id="venue_id" name="venue_id" defaultValue={event?.venue_id ?? ""} className="field">
            <option value="">Chưa chọn</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className="label">Ngày bắt đầu (dương lịch)</label>
          <input id="start_date" name="start_date" type="date" required defaultValue={event?.start_date} className="field" />
        </div>
        <div>
          <label htmlFor="end_date" className="label">Ngày kết thúc</label>
          <input id="end_date" name="end_date" type="date" defaultValue={event?.end_date} className="field" />
          <p className="hint">Để trống nếu sự kiện chỉ diễn ra một ngày.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lunar_text" className="label">Ngày âm lịch</label>
          <input id="lunar_text" name="lunar_text" placeholder="14–15/4 AL" defaultValue={event?.lunar_text ?? ""} className="field" />
        </div>
        <div>
          <label htmlFor="capacity" className="label">Số chỗ tối đa</label>
          <input id="capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ""} className="field" />
          <p className="hint">Để trống nếu không giới hạn.</p>
        </div>
      </div>

      <div>
        <label htmlFor="cover_url" className="label">Ảnh bìa (liên kết https)</label>
        <input id="cover_url" name="cover_url" type="url" placeholder="https://..." defaultValue={event?.cover_url ?? ""} className="field" />
        <p className="hint">Không bắt buộc. Nên dùng ảnh ngang, tỉ lệ 16:9.</p>
      </div>

      <div>
        <label htmlFor="description" className="label">Chương trình, lưu ý</label>
        <textarea id="description" name="description" rows={6} defaultValue={event?.description ?? ""} className="field" />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="registration_open" defaultChecked={event?.registration_open ?? true} className="mt-1 h-5 w-5 accent-pine" />
          <span>Đang mở đăng ký</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="published" defaultChecked={event?.published ?? false} className="mt-1 h-5 w-5 accent-pine" />
          <span>Hiển thị trên trang công khai</span>
        </label>
      </div>

      <button type="submit" className="btn btn-primary">Lưu sự kiện</button>
    </form>
  );
}
