-- Add employee phone numbers and retain them on payroll snapshots.
-- Run this script once in the Supabase SQL Editor.

alter table public.employees
  add column if not exists phone text;

alter table public.payroll_items
  add column if not exists employee_phone text;

-- Backfill phone numbers for existing payroll items where the employee record is linked.
update public.payroll_items as item
set employee_phone = employee.phone
from public.employees as employee
where item.employee_id = employee.id
  and (item.employee_phone is null or item.employee_phone = '');
