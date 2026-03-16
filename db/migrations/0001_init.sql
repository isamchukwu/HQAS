create extension if not exists "uuid-ossp";

create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    role text not null default 'operator' check (role in ('admin', 'operator')),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table customers (
    id uuid primary key default uuid_generate_v4(),
    company_name text not null,
    contact_person text,
    email text,
    phone text,
    address text,
    notes text,
    created_by uuid references profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_customers_company_name on customers(company_name);
create index idx_customers_email on customers(email);

create table items_master (
    id uuid primary key default uuid_generate_v4(),
    item_code text unique,
    item_name text not null,
    standard_description text not null,
    unit text not null,
    default_price numeric(18,2) not null default 0 check (default_price >= 0),
    category text,
    notes text,
    is_active boolean not null default true,
    created_by uuid references profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_items_master_name on items_master(item_name);
create index idx_items_master_code on items_master(item_code);
create index idx_items_master_category on items_master(category);

create table quote_counters (
    year integer primary key,
    last_number integer not null default 0 check (last_number >= 0),
    updated_at timestamptz not null default now()
);

create table quotes (
    id uuid primary key default uuid_generate_v4(),
    quote_number text not null unique,
    customer_id uuid not null references customers(id),
    quote_date date not null,
    reference text,
    currency text not null default 'NGN' check (currency = 'NGN'),
    subtotal numeric(18,2) not null default 0 check (subtotal >= 0),
    tax_amount numeric(18,2) not null default 0 check (tax_amount >= 0),
    discount_amount numeric(18,2) not null default 0 check (discount_amount >= 0),
    grand_total numeric(18,2) not null default 0,
    notes text,
    status text not null default 'draft' check (status in ('draft', 'final')),
    created_by uuid references profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_quotes_customer_id on quotes(customer_id);
create index idx_quotes_quote_date on quotes(quote_date);
create index idx_quotes_status on quotes(status);

create table quote_lines (
    id uuid primary key default uuid_generate_v4(),
    quote_id uuid not null references quotes(id) on delete cascade,
    line_number integer not null check (line_number > 0),
    item_id uuid references items_master(id),
    description text not null,
    quantity numeric(18,2) not null default 0 check (quantity >= 0),
    unit text not null,
    unit_price numeric(18,2) not null default 0 check (unit_price >= 0),
    amount numeric(18,2) not null default 0 check (amount >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (quote_id, line_number)
);

create index idx_quote_lines_quote_id on quote_lines(quote_id);
create index idx_quote_lines_item_id on quote_lines(item_id);

create table generated_files (
    id uuid primary key default uuid_generate_v4(),
    quote_id uuid not null references quotes(id) on delete cascade,
    file_type text not null check (file_type in ('docx', 'pdf')),
    file_name text not null,
    file_path text not null,
    created_by uuid references profiles(id),
    created_at timestamptz not null default now()
);

create index idx_generated_files_quote_id on generated_files(quote_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

create trigger trg_customers_updated_at
before update on customers
for each row execute function set_updated_at();

create trigger trg_items_master_updated_at
before update on items_master
for each row execute function set_updated_at();

create trigger trg_quotes_updated_at
before update on quotes
for each row execute function set_updated_at();

create trigger trg_quote_lines_updated_at
before update on quote_lines
for each row execute function set_updated_at();

create or replace function generate_quote_number()
returns text as $$
declare
  quote_year integer;
  next_number integer;
begin
  quote_year := extract(year from now())::integer;

  insert into quote_counters (year, last_number)
  values (quote_year, 1)
  on conflict (year)
  do update set
    last_number = quote_counters.last_number + 1,
    updated_at = now()
  returning last_number into next_number;

  return 'HOAS-' || quote_year::text || '-' || lpad(next_number::text, 4, '0');
end;
$$ language plpgsql;

create or replace function set_quote_number()
returns trigger as $$
begin
  if new.quote_number is null or new.quote_number = '' then
    new.quote_number := generate_quote_number();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_quotes_set_quote_number
before insert on quotes
for each row execute function set_quote_number();
