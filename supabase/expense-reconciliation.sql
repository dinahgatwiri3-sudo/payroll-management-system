-- Expense monitoring, payment imports, exception reporting and reconciliation.
-- Run once in Supabase SQL Editor. The backend accesses these tables using the
-- existing server-only service-role client; never place that key in the browser.

create table if not exists public.expense_records (
 id uuid primary key default gen_random_uuid(),
 expense_date date not null,
 category text not null,
 description text not null,
 payee text,
 reference text,
 amount numeric(14,2) not null check (amount > 0),
 status text not null default 'Pending' check (status in ('Pending','Approved','Paid','Rejected')),
 created_by text,
 updated_by text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists expense_records_date_idx on public.expense_records(expense_date desc);
create index if not exists expense_records_status_idx on public.expense_records(status);

create table if not exists public.payment_imports (
 id uuid primary key default gen_random_uuid(),
 source text not null check (source in ('Bank','M-Pesa')),
 file_name text,
 row_count integer not null default 0,
 imported_by text,
 imported_at timestamptz not null default now()
);

create table if not exists public.payment_records (
 id uuid primary key default gen_random_uuid(),
 import_id uuid references public.payment_imports(id) on delete set null,
 source text not null check (source in ('Bank','M-Pesa','Manual')),
 record_type text not null default 'Payroll' check (record_type in ('Payroll','Expense')),
 transaction_date date not null,
 amount numeric(14,2) not null check (amount > 0),
 reference text,
 recipient_name text,
 recipient_phone text,
 description text,
 matched boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists payment_records_reference_idx on public.payment_records(reference);
create index if not exists payment_records_date_idx on public.payment_records(transaction_date desc);
create index if not exists payment_records_match_idx on public.payment_records(matched, record_type);

create table if not exists public.exceptions (
 id uuid primary key default gen_random_uuid(),
 exception_type text not null,
 severity text not null default 'Medium' check (severity in ('Low','Medium','High')),
 description text not null,
 related_type text,
 related_id uuid,
 amount numeric(14,2),
 status text not null default 'Open' check (status in ('Open','Investigating','Resolved','Dismissed')),
 detected_at timestamptz not null default now(),
 resolved_by text,
 resolved_at timestamptz,
 resolution_note text
);
create index if not exists exceptions_status_idx on public.exceptions(status, detected_at desc);

alter table public.expense_records enable row level security;
alter table public.payment_imports enable row level security;
alter table public.payment_records enable row level security;
alter table public.exceptions enable row level security;
revoke all on public.expense_records, public.payment_imports, public.payment_records, public.exceptions from anon, authenticated;
grant all on public.expense_records, public.payment_imports, public.payment_records, public.exceptions to service_role;
