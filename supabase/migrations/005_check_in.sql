-- Check-in tại sự kiện bằng mã QR (hoặc nhập mã tay).
-- Chạy sau 001–004: Supabase > SQL Editor > New query > dán > Run. Chạy lại nhiều lần không sao.

alter table public.registrations
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_in_by uuid;

create index if not exists registrations_checked_in_idx
  on public.registrations (event_id) where checked_in_at is not null;

-- Check-in một đăng ký. Chỉ quản trị viên gọi được.
-- p_approve = true: cho phép duyệt luôn đăng ký đang chờ (người đến trực tiếp mà chưa kịp duyệt).
-- Khóa dòng (FOR UPDATE) để hai người quét cùng một mã cùng lúc chỉ ghi nhận một lần.
create or replace function public.check_in_registration(p_code text, p_approve boolean default false)
returns timestamptz
language plpgsql
security invoker
set search_path = public
as $$
declare
  r public.registrations%rowtype;
  t timestamptz := now();
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;

  select * into r
    from public.registrations
   where public.registrations.code = upper(trim(p_code))
   for update;
  if not found then
    raise exception 'REGISTRATION_NOT_FOUND';
  end if;

  if r.checked_in_at is not null then
    raise exception 'ALREADY_CHECKED_IN';
  end if;

  if r.status = 'pending' and p_approve then
    r.status := 'approved';
  elsif r.status <> 'approved' then
    raise exception 'NOT_APPROVED';
  end if;

  update public.registrations
     set status = r.status, checked_in_at = t, checked_in_by = auth.uid()
   where id = r.id;
  return t;
end;
$$;

revoke execute on function public.check_in_registration(text, boolean) from public, anon;
grant execute on function public.check_in_registration(text, boolean) to authenticated;

-- Đã check-in thì không tự hủy được nữa
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
     and status in ('pending', 'approved')
     and checked_in_at is null;
  return found;
end;
$$;

-- Nhật ký: ghi thêm thao tác check-in (giữ nguyên phần ghi đổi trạng thái và xóa của 003)
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
    if new.checked_in_at is distinct from old.checked_in_at then
      insert into public.audit_logs (actor_id, actor_email, action, event_id, record_id, changes)
      values (auth.uid(), public.audit_actor_email(), 'registration.checkin', new.event_id, new.id,
              jsonb_build_object('code', new.code, 'luc', new.checked_in_at));
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
