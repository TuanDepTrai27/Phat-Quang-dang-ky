-- Nhật ký thao tác (audit log): ghi lại ai đã tạo/sửa/xóa sự kiện, đổi trạng thái đăng ký, lúc nào.
-- Ghi tự động bằng trigger nên không thể "quên" ghi; admin chỉ được đọc, không sửa/xóa được.
-- Chạy sau 001 và 002: Supabase > SQL Editor > New query > dán > Run.

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid,                 -- null = người đăng ký tự thao tác (không đăng nhập)
  actor_email text,
  action text not null,          -- event.insert | event.update | event.delete | registration.status | registration.delete
  event_id uuid,                 -- để lọc nhật ký theo sự kiện
  record_id uuid not null,
  changes jsonb                  -- chỉ các trường thay đổi; với đăng ký chỉ lưu mã + trạng thái (không chép dữ liệu cá nhân)
);

create index if not exists audit_logs_event_idx on public.audit_logs (event_id, at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "admin đọc nhật ký" on public.audit_logs;
create policy "admin đọc nhật ký" on public.audit_logs
  for select using (public.is_admin());
-- Không có policy insert/update/delete: chỉ trigger (chạy với quyền chủ bảng) mới ghi được.

create or replace function public.audit_actor_email()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select email from auth.users where id = auth.uid();
$$;

-- Trường nào khác nhau giữa bản cũ và bản mới
create or replace function public.audit_diff(old_row jsonb, new_row jsonb)
returns jsonb
language sql
immutable
as $$
  select coalesce(jsonb_object_agg(n.key, jsonb_build_object('cu', old_row -> n.key, 'moi', n.value)), '{}'::jsonb)
  from jsonb_each(new_row) n
  where n.value is distinct from (old_row -> n.key);
$$;

create or replace function public.audit_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  d jsonb;
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs (actor_id, actor_email, action, event_id, record_id, changes)
    values (auth.uid(), public.audit_actor_email(), 'event.insert', new.id, new.id,
            jsonb_build_object('title', new.title, 'start_date', new.start_date));
    return new;
  elsif tg_op = 'UPDATE' then
    d := public.audit_diff(to_jsonb(old), to_jsonb(new));
    if d <> '{}'::jsonb then
      insert into public.audit_logs (actor_id, actor_email, action, event_id, record_id, changes)
      values (auth.uid(), public.audit_actor_email(), 'event.update', new.id, new.id, d);
    end if;
    return new;
  else
    insert into public.audit_logs (actor_id, actor_email, action, event_id, record_id, changes)
    values (auth.uid(), public.audit_actor_email(), 'event.delete', null, old.id,
            jsonb_build_object('title', old.title));
    return old;
  end if;
end;
$$;

create or replace function public.audit_registrations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      insert into public.audit_logs (actor_id, actor_email, action, event_id, record_id, changes)
      values (auth.uid(), public.audit_actor_email(), 'registration.status', new.event_id, new.id,
              jsonb_build_object('code', new.code, 'cu', old.status, 'moi', new.status));
    end if;
    return new;
  else
    insert into public.audit_logs (actor_id, actor_email, action, event_id, record_id, changes)
    values (auth.uid(), public.audit_actor_email(), 'registration.delete', old.event_id, old.id,
            jsonb_build_object('code', old.code, 'status', old.status));
    return old;
  end if;
end;
$$;

drop trigger if exists audit_events_trg on public.events;
create trigger audit_events_trg
  after insert or update or delete on public.events
  for each row execute function public.audit_events();

drop trigger if exists audit_registrations_trg on public.registrations;
create trigger audit_registrations_trg
  after update or delete on public.registrations
  for each row execute function public.audit_registrations();

-- Các hàm trigger không cho gọi trực tiếp từ API
revoke execute on function public.audit_events() from public, anon, authenticated;
revoke execute on function public.audit_registrations() from public, anon, authenticated;
revoke execute on function public.audit_actor_email() from public, anon, authenticated;
