-- Role-based access control for the Payroll Management and Audit System.
-- Run this script once in Supabase SQL Editor.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('admin', 'payroll_officer', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;
grant all on public.user_roles to service_role;

-- Every newly registered account starts with read-only Viewer access.
create or replace function public.assign_default_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'viewer')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_role on auth.users;
create trigger on_auth_user_created_assign_role
  after insert on auth.users
  for each row execute procedure public.assign_default_user_role();

-- Promote the intended system administrator.
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where lower(email) = lower('dinahgatwiri3@gmail.com')
on conflict (user_id)
do update set role = 'admin', updated_at = now();

