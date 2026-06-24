-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- DEPARTMENTS TABLE
create table public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  machine_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MACHINES TABLE
create table public.machines (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  department_id uuid references public.departments(id),
  department_name text not null,
  status text check (status in ('running', 'stop', 'maintenance')) default 'running',
  capacity text,
  operator text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MASTER DETAILS TABLE
create table public.master_details (
  id uuid default uuid_generate_v4() primary key,
  dispo text not null,
  po_no text not null,
  buyer_name text not null,
  construction text,
  composition text,
  wave_type text,
  color text,
  order_qty numeric,
  unit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DYES/CHEMICALS TABLE
create table public.dyes_chemicals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text check (type in ('D', 'C')),
  rate numeric,
  department text,
  unit text,
  stock_qty numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTION ENTRIES TABLE
create table public.production_entries (
  id uuid default uuid_generate_v4() primary key,
  dispo_no text not null,
  colour text,
  construction text,
  buyer text,
  shift text,
  batch_no text,
  weave_type text,
  order_qty numeric,
  start_width text,
  end_width text,
  temp text,
  production_start_qty numeric,
  intensity text,
  padder_pressure text,
  position text,
  production_end_qty numeric,
  machine_name text,
  process_name text,
  machine_speed text,
  star_batcher text,
  end_batcher text,
  prod_start_datetime timestamp with time zone,
  prod_end_datetime timestamp with time zone,
  remarks text,
  status text default 'Submitted',
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COSTING ENTRIES TABLE
create table public.costing_entries (
  id uuid default uuid_generate_v4() primary key,
  production_entry_id uuid references public.production_entries(id) on delete cascade,
  dye_chemical_id uuid references public.dyes_chemicals(id),
  dye_chemical_name text not null,
  category text check (category in ('dyes', 'chemical')),
  qty numeric,
  unit text check (unit in ('kg', 'gram')),
  open_stock numeric,
  closing_stock numeric,
  rate numeric,
  total_cost numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SEED DATA (MIGRATED FROM MOCK DATA)
-- 1. Departments
insert into public.departments (id, name, machine_count) values
  ('11111111-1111-1111-1111-111111111111', 'Weaving', 12),
  ('22222222-2222-2222-2222-222222222222', 'Dyeing', 8),
  ('33333333-3333-3333-3333-333333333333', 'Finishing', 6),
  ('44444444-4444-4444-4444-444444444444', 'Pretreatment Unit 1', 4),
  ('55555555-5555-5555-5555-555555555555', 'Pretreatment Unit 2', 4),
  ('66666666-6666-6666-6666-666666666666', 'Quality Control', 3),
  ('77777777-7777-7777-7777-777777777777', 'Stentering', 5),
  ('88888888-8888-8888-8888-888888888888', 'Sanforizing', 3);

-- 2. Machines
insert into public.machines (id, name, department_id, department_name, status, capacity, operator) values
  ('11111111-1111-1111-1111-111111111111', 'Weaving Loom A1', '11111111-1111-1111-1111-111111111111', 'Weaving', 'running', '5000 m/day', 'Rahim Khan'),
  ('22222222-2222-2222-2222-222222222222', 'Weaving Loom A2', '11111111-1111-1111-1111-111111111111', 'Weaving', 'running', '5000 m/day', 'Alamgir Hossain'),
  ('33333333-3333-3333-3333-333333333333', 'Weaving Loom B1', '11111111-1111-1111-1111-111111111111', 'Weaving', 'stop', '4800 m/day', null),
  ('44444444-4444-4444-4444-444444444444', 'Weaving Loom B2', '11111111-1111-1111-1111-111111111111', 'Weaving', 'running', '5000 m/day', 'Karim Uddin'),
  ('55555555-5555-5555-5555-555555555555', 'Dyeing Machine D1', '22222222-2222-2222-2222-222222222222', 'Dyeing', 'running', '3000 kg/day', 'Fatima Begum');

-- 3. Master Details
insert into public.master_details (dispo, po_no, buyer_name, construction, composition, wave_type, color, order_qty, unit) values
  ('MS260779', 'SM260600657R-1', 'ZARA', '16Rx16R/108x64', '100% Cotton', '3/1 "S" Twill', 'BROWN (as per Swatch)', 50.00, 'YDS'),
  ('MP260721', 'BK260600343', 'H&M', '45TCx45TC/110x76', '65% Recycle polyester 35% BCI Cotton', 'Plain', '74-202/005 (Blue Light Solid)', 1800.00, 'YDS');

-- 4. Dyes/Chemicals
insert into public.dyes_chemicals (id, name, type, rate, department, unit, stock_qty) values
  ('11111111-1111-1111-1111-111111111111', 'dsg red', 'D', 120, 'Finishing', 'kg', 450),
  ('22222222-2222-2222-2222-222222222222', 'acetic acid', 'C', 35, 'Pretreatment Unit 1', 'kg', 800);

-- Enable RLS (Row Level Security) - basic permissive rules for now
alter table public.departments enable row level security;
alter table public.machines enable row level security;
alter table public.master_details enable row level security;
alter table public.dyes_chemicals enable row level security;
alter table public.production_entries enable row level security;
alter table public.costing_entries enable row level security;

create policy "Enable all access for authenticated users on departments" on public.departments for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users on machines" on public.machines for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users on master_details" on public.master_details for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users on dyes_chemicals" on public.dyes_chemicals for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users on production_entries" on public.production_entries for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users on costing_entries" on public.costing_entries for all using (auth.role() = 'authenticated');
