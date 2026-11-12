import { createClient } from "./supabase/server";
import type { PublicEvent } from "./types";

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("list_public_events");
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicEvent[];
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  const all = await getPublicEvents();
  return all.find((e) => e.slug === slug) ?? null;
}
