import { addVenueAction, deleteVenueAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import type { Venue } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("venues").select("*").order("name");
  const venues = (data ?? []) as Venue[];

  return (
    <>
      <h1 className="text-3xl">Địa điểm</h1>

      {venues.length > 0 && (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {venues.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{v.name}</p>
                {v.address && <p className="text-sm text-muted">{v.address}</p>}
              </div>
              <form action={deleteVenueAction}>
                <input type="hidden" name="id" value={v.id} />
                <button type="submit" className="btn btn-quiet btn-sm text-lotus">Xóa</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-2xl">Thêm địa điểm</h2>
      <form action={addVenueAction} className="mt-4 max-w-xl space-y-5">
        <div>
          <label htmlFor="name" className="label">Tên địa điểm</label>
          <input id="name" name="name" required className="field" />
        </div>
        <div>
          <label htmlFor="address" className="label">Địa chỉ</label>
          <input id="address" name="address" className="field" />
        </div>
        <div>
          <label htmlFor="map_url" className="label">Liên kết bản đồ</label>
          <input id="map_url" name="map_url" type="url" placeholder="https://maps.app.goo.gl/..." className="field" />
        </div>
        <button type="submit" className="btn btn-primary">Thêm địa điểm</button>
      </form>
    </>
  );
}
