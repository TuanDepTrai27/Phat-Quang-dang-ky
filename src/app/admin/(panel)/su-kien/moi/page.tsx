import { EventForm } from "@/components/EventForm";
import { requireAdmin } from "@/lib/auth";
import type { Venue } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewEventPage({ searchParams }: { searchParams: { loi?: string } }) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("venues").select("*").order("name");

  return (
    <>
      <h1 className="text-3xl">Thêm sự kiện</h1>
      {searchParams.loi && (
        <div role="alert" className="mt-4 max-w-2xl rounded-md border border-lotus/40 bg-lotus/10 px-4 py-3 text-lotus">
          {searchParams.loi}
        </div>
      )}
      <div className="mt-6">
        <EventForm venues={(data ?? []) as Venue[]} />
      </div>
    </>
  );
}
