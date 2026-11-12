-- =====================================================================
-- Hệ thống đăng ký khóa tu, sự kiện - Thiền Tôn Phật Quang
-- Chạy toàn bộ file này trong Supabase: SQL Editor > New query > Run
-- (Sau đó chạy thêm migrations/001_anh_bia.sql để có ảnh bìa sự kiện)
-- =====================================================================

-- ---------- Bảng dữ liệu ----------

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  map_url text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  event_type text not null default 'khac'
    check (event_type in ('khoa_thien', 'dai_le', 'quy_y', 'thuyet_giang', 'khac')),
  description text,
  venue_id uuid references public.venues(id) on delete set null,
  start_date date not null,
  end_date date not null,
  lunar_text text,                         -- ví dụ: '14–15/4 AL' (admin nhập tay)
  capacity integer check (capacity is null or capacity > 0),  -- null = không giới hạn
  registration_open boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,               -- mã đăng ký, ví dụ PQ-7K3M9X
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  dharma_name text,                        -- pháp danh
  phone text not null,                     -- dạng 0xxxxxxxxx
  birth_year integer check (birth_year between 1900 and 2100),
  gender text check (gender in ('nam', 'nu')),
  province text,
  is_first_time boolean not null default false,
  needs_lodging boolean not null default false,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default now()
);

create index registrations_event_idx on public.registrations (event_id, status);
create index registrations_phone_idx on public.registrations (phone);

-- Tài khoản quản trị (người đăng nhập trang /admin)
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- Phân quyền (Row Level Security) ----------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.admins enable row level security;

-- Người dùng ẩn danh KHÔNG đọc/ghi trực tiếp vào bảng nào.
-- Họ chỉ gọi các hàm bên dưới (list_public_events, register_for_event, ...).
create policy "admin toàn quyền venues" on public.venues
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin toàn quyền events" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin toàn quyền registrations" on public.registrations
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin tự đọc dòng của mình" on public.admins
  for select using (user_id = auth.uid());

-- ---------- Hàm công khai ----------

-- Danh sách sự kiện đã đăng, kèm số người đã đăng ký (chờ duyệt + đã duyệt)
-- (migrations/001_anh_bia.sql thay hàm này bằng bản có cover_url)
create or replace function public.list_public_events()
returns table (
  id uuid, slug text, title text, event_type text, description text,
  venue_name text, venue_address text, map_url text,
  start_date date, end_date date, lunar_text text,
  capacity integer, registration_open boolean, taken bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select e.id, e.slug, e.title, e.event_type, e.description,
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

-- Đăng ký tham dự. Kiểm tra chỗ trống và trùng đăng ký, trả về mã đăng ký.
create or replace function public.register_for_event(
  p_event uuid,
  p_full_name text,
  p_dharma_name text,
  p_phone text,
  p_birth_year integer,
  p_gender text,
  p_province text,
  p_is_first_time boolean,
  p_needs_lodging boolean,
  p_notes text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.events%rowtype;
  taken integer;
  new_code text;
begin
  if length(trim(coalesce(p_full_name, ''))) < 2 or length(coalesce(p_phone, '')) < 9 then
    raise exception 'INVALID_INPUT';
  end if;

  -- khóa dòng sự kiện để hai người đăng ký cùng lúc không vượt quá số chỗ
  select * into ev from public.events where id = p_event and published for update;
  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if not ev.registration_open
     or ev.end_date < (now() at time zone 'Asia/Ho_Chi_Minh')::date then
    raise exception 'REGISTRATION_CLOSED';
  end if;

  if exists (
    select 1 from public.registrations r
    where r.event_id = p_event
      and r.phone = p_phone
      and lower(r.full_name) = lower(trim(p_full_name))
      and r.status in ('pending', 'approved')
  ) then
    raise exception 'ALREADY_REGISTERED';
  end if;

  if ev.capacity is not null then
    select count(*) into taken from public.registrations r
      where r.event_id = p_event and r.status in ('pending', 'approved');
    if taken >= ev.capacity then
      raise exception 'EVENT_FULL';
    end if;
  end if;

  loop
    new_code := 'PQ-' || (
      select string_agg(
        substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      from generate_series(1, 6)
    );
    begin
      insert into public.registrations (
        code, event_id, full_name, dharma_name, phone, birth_year, gender,
        province, is_first_time, needs_lodging, notes
      ) values (
        new_code, p_event, trim(p_full_name), nullif(trim(p_dharma_name), ''), p_phone,
        p_birth_year, p_gender, nullif(trim(p_province), ''),
        coalesce(p_is_first_time, false), coalesce(p_needs_lodging, false),
        nullif(left(trim(coalesce(p_notes, '')), 500), '')
      );
      return new_code;
    exception when unique_violation then
      null; -- trùng mã (rất hiếm), thử mã khác
    end;
  end loop;
end;
$$;

-- Tra cứu đăng ký bằng mã + số điện thoại
create or replace function public.lookup_registration(p_code text, p_phone text)
returns table (
  code text, full_name text, status text,
  event_title text, event_slug text,
  start_date date, end_date date, venue_name text
)
language sql
security definer
stable
set search_path = public
as $$
  select r.code, r.full_name, r.status, e.title, e.slug, e.start_date, e.end_date, v.name
  from public.registrations r
  join public.events e on e.id = r.event_id
  left join public.venues v on v.id = e.venue_id
  where r.code = upper(trim(p_code)) and r.phone = p_phone;
$$;

-- Người đăng ký tự hủy
create or replace function public.cancel_registration(p_code text, p_phone text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.registrations
     set status = 'cancelled'
   where code = upper(trim(p_code))
     and phone = p_phone
     and status in ('pending', 'approved');
  return found;
end;
$$;

grant execute on function public.list_public_events() to anon, authenticated;
grant execute on function public.register_for_event(uuid, text, text, text, integer, text, text, boolean, boolean, text) to anon, authenticated;
grant execute on function public.lookup_registration(text, text) to anon, authenticated;
grant execute on function public.cancel_registration(text, text) to anon, authenticated;
