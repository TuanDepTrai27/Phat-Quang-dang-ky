-- Thêm ảnh bìa cho sự kiện. Chạy một lần trong Supabase: SQL Editor > New query > Run.
alter table public.events add column if not exists cover_url text;

drop function if exists public.list_public_events();

create function public.list_public_events()
returns table (
  id uuid, slug text, title text, event_type text, description text, cover_url text,
  venue_name text, venue_address text, map_url text,
  start_date date, end_date date, lunar_text text,
  capacity integer, registration_open boolean, taken bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select e.id, e.slug, e.title, e.event_type, e.description, e.cover_url,
         v.name, v.address, v.map_url,
         e.start_date, e.end_date, e.lunar_text,
         e.capacity, e.registration_open,
         (select count(*) from public.registrations r
           where r.event_id = e.id and r.status in ('pending', 'approved'))
  from public.events e
  left join public.venues v on v.id = e.venue_id
  where e.published
  order by e.start_date asc, e.title asc;
$$;

grant execute on function public.list_public_events() to anon, authenticated;
