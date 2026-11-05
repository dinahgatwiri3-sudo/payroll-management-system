create extension if not exists pgcrypto;
create table if not exists public.employees(
 id uuid primary key default gen_random_uuid(), employee_no text not null unique, full_name text not null,
 email text, department text, job_title text, monthly_salary numeric(14,2) not null default 0,
 status text not null default 'Active' check(status in ('Active','Inactive')), created_at timestamptz not null default now()
);
create table if not exists public.payroll_runs(
 id uuid primary key default gen_random_uuid(), period text not null, pay_date date, employee_count integer not null default 0,
 gross_total numeric(16,2) not null default 0, status text not null default 'Draft' check(status in ('Draft','Approved','Paid','Cancelled')),
 created_by text, created_at timestamptz not null default now()
);
create table if not exists public.payroll_items(
 id uuid primary key default gen_random_uuid(), payroll_run_id uuid not null references public.payroll_runs(id) on delete cascade,
 employee_id uuid references public.employees(id) on delete set null, employee_name text not null, employee_no text not null,
 basic_salary numeric(14,2) not null default 0, allowances numeric(14,2) not null default 0,
 deductions numeric(14,2) not null default 0, net_pay numeric(14,2) not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.audit_logs(
 id uuid primary key default gen_random_uuid(), actor_email text, action text not null, details text, created_at timestamptz not null default now()
);
alter table public.employees enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_items enable row level security;
alter table public.audit_logs enable row level security;
revoke all on public.employees,public.payroll_runs,public.payroll_items,public.audit_logs from anon,authenticated;
grant all on public.employees,public.payroll_runs,public.payroll_items,public.audit_logs to service_role;
