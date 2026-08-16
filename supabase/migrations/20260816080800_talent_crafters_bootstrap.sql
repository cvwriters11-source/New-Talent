-- Talent Crafters blank-project bootstrap. Generated from the operational schema history.
-- Apply this migration once to a new Supabase project.


-- BEGIN .tmp-sb-extract\001_talent_crafters_core.sql
-- name: talent_crafters_core
-- tool: CallMcpTool
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

-- Talent Crafters Career Development tables (namespaced tc_)

create table if not exists public.tc_packages (
  slug text primary key,
  name text not null,
  subtitle text,
  tagline text not null,
  summary text not null,
  price_label text not null default 'Request a quote',
  includes jsonb not null default '[]'::jsonb,
  ideal_for text not null default '',
  timeline text not null default '',
  region text,
  color_options jsonb,
  sample_image text,
  quote_amount numeric not null default 1500,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tc_customers (
  id text primary key,
  name text not null,
  email text not null,
  whatsapp text not null default '',
  country text not null default '',
  orders integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists tc_customers_email_lower_idx
  on public.tc_customers (lower(email));

create table if not exists public.tc_orders (
  id text primary key,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  first_name text not null,
  surname text not null,
  email text not null,
  whatsapp text not null default '',
  location text not null default '',
  country text not null default '',
  package_slug text not null references public.tc_packages(slug) on delete restrict,
  package_name text not null,
  cv_color text,
  cv_url text,
  picture_url text,
  amount numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_writer text
);

create index if not exists tc_orders_created_at_idx on public.tc_orders (created_at desc);
create index if not exists tc_orders_status_idx on public.tc_orders (status);

create table if not exists public.tc_site_popup (
  id integer primary key default 1 check (id = 1),
  active boolean not null default false,
  title text not null default 'Welcome to Talent Crafters',
  message text not null default 'Explore our Career Development packages.',
  image_url text,
  cta_label text default 'View packages',
  cta_href text default '/packages',
  updated_at timestamptz not null default now()
);

alter table public.tc_packages enable row level security;
alter table public.tc_customers enable row level security;
alter table public.tc_orders enable row level security;
alter table public.tc_site_popup enable row level security;

-- Public read of live packages
create policy "tc_packages_public_read"
  on public.tc_packages for select
  to anon, authenticated
  using (active = true);

-- Public read of active popup
create policy "tc_popup_public_read"
  on public.tc_site_popup for select
  to anon, authenticated
  using (active = true);

-- Checkout inserts (server may also use service role)
create policy "tc_orders_public_insert"
  on public.tc_orders for insert
  to anon, authenticated
  with check (true);

create policy "tc_customers_public_insert"
  on public.tc_customers for insert
  to anon, authenticated
  with check (true);

create policy "tc_customers_public_update"
  on public.tc_customers for update
  to anon, authenticated
  using (true)
  with check (true);

-- Seed singleton popup row
insert into public.tc_site_popup (id, active, title, message, cta_label, cta_href)
values (
  1,
  false,
  'Welcome to Talent Crafters',
  'Explore our Career Development packages — ATS-friendly CVs for every stage of your journey.',
  'View packages',
  '/packages'
)
on conflict (id) do nothing;

-- Seed default packages
insert into public.tc_packages (
  slug, name, subtitle, tagline, summary, price_label, includes, ideal_for,
  timeline, region, color_options, quote_amount, active, sort_order
) values
(
  'graduate-package',
  'Graduate Package',
  'Fresh Graduate Package',
  'ATS-friendly CV writing for Africa — start your career strong.',
  'Our Fresh Graduate Package is designed for graduates and early-career candidates applying across Africa. You get expert ATS-friendly CV writing, a job application email template, and LinkedIn optimisation — with a CV colour you choose: Teal, Dark green, or Blue.',
  'Request a quote',
  '["Expert ATS-friendly CV writing (optimised for screening systems)","Fresh graduate layout highlighting education, projects, and potential","Job application email template","LinkedIn optimisation","Client colour choice: Teal, Dark green, or Blue","Africa-focused application positioning"]'::jsonb,
  'Fresh graduates and early-career candidates seeking roles within Africa.',
  '10 working days',
  'Africa only',
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"dark-green","label":"Dark green","hex":"#14532d"},{"id":"blue","label":"Blue","hex":"#1e3a5f"}]'::jsonb,
  1200, true, 1
),
(
  'professional-package',
  'Professional Package',
  'Professional — Package',
  'ATS-friendly CV writing for working professionals across Africa.',
  'Our Professional Package is built for experienced candidates applying within Africa. You get expert ATS-friendly CV writing and design, LinkedIn optimisation, job application email templates, free career hunt techniques, and your email and CV added to our recruiters database.',
  'Request a quote',
  '["Turn around time 7 working days (ONLY AFRICA)","Expert ATS-FRIENDLY CV writing","Adding your email and CV into Recruiters Database","Job Application Email Template","Free Career Hunt Techniques","LinkedIn Optimization","CV Design"]'::jsonb,
  'Working professionals seeking stronger roles within Africa with recruiter-backed CV support.',
  '7 working days',
  'Africa only',
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"blue","label":"Blue","hex":"#1a4b8c"},{"id":"navy","label":"Navy","hex":"#0a2540"},{"id":"dark-grey","label":"Dark grey","hex":"#3a3f47"}]'::jsonb,
  1800, true, 2
),
(
  'executive-package',
  'Executive Package',
  'Executive — Package',
  'Senior ATS-friendly CV writing for executives across Africa.',
  'Our Executive Package is built for senior leaders applying within Africa. You get expert ATS-friendly CV and cover letter writing, LinkedIn optimisation, recruiter outreach support, interview preparation, salary negotiation tools, and free help with job placements — with a 5 working day turnaround.',
  'Request a quote',
  '["Turn around time 5 working days (ONLY AFRICA)","Expert ATS-FRIENDLY CV writing","Adding your email and CV into Recruiters Database","Job Application Email Template","Free Career Hunt Techniques","Free salary negotiation Template","Free help with job placements","Submitting your CV and cover letter to potential Recruiters and hiring managers","Interview preparation","Cover letter writing","LinkedIn Optimisation"]'::jsonb,
  'Senior professionals, managers, and executives competing for high-stakes roles within Africa.',
  '5 working days',
  'Africa only',
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"navy","label":"Navy","hex":"#0a2540"},{"id":"blue","label":"Blue","hex":"#1a4b8c"},{"id":"dark-grey","label":"Dark grey","hex":"#3a3f47"}]'::jsonb,
  2500, true, 3
),
(
  'international-resume',
  'International Resume',
  'International — Package',
  'ATS-friendly résumé writing for international applications.',
  'Our International Package is designed for candidates applying globally. You get expert ATS-friendly résumé writing and design, LinkedIn optimisation, cover letter writing, interview preparation, recruiter outreach support, salary negotiation tools, and free help with job placements — with a 4 working day turnaround.',
  'Request a quote',
  '["Turn around time 4 working days","Expert ATS-FRIENDLY Résumé writing","Adding your email and Résumé into Recruiters Database","Job Application Email Template","Free Career Hunt Techniques","Free salary negotiation Template","Free help with job placements","Submitting your Résumé and cover letter to potential Recruiters and hiring managers","Interview preparation","Cover letter writing","LinkedIn Optimisation","Résumé design"]'::jsonb,
  'Professionals applying for roles outside South Africa who need an internationally styled résumé.',
  '4 working days',
  null,
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"navy","label":"Navy","hex":"#0a2540"},{"id":"blue","label":"Blue","hex":"#1a4b8c"},{"id":"dark-grey","label":"Dark grey","hex":"#3a3f47"}]'::jsonb,
  2200, true, 4
)
on conflict (slug) do nothing;

-- END .tmp-sb-extract\001_talent_crafters_core.sql

-- BEGIN .tmp-sb-extract\003_talent_crafters_policies_seed.sql
-- name: talent_crafters_policies_seed
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

drop policy if exists "tc_packages_public_read" on public.tc_packages;
create policy "tc_packages_public_read"
  on public.tc_packages for select
  to anon, authenticated
  using (active = true);

drop policy if exists "tc_popup_public_read" on public.tc_site_popup;
create policy "tc_popup_public_read"
  on public.tc_site_popup for select
  to anon, authenticated
  using (active = true);

drop policy if exists "tc_orders_public_insert" on public.tc_orders;
create policy "tc_orders_public_insert"
  on public.tc_orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "tc_customers_public_insert" on public.tc_customers;
create policy "tc_customers_public_insert"
  on public.tc_customers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "tc_customers_public_update" on public.tc_customers;
create policy "tc_customers_public_update"
  on public.tc_customers for update
  to anon, authenticated
  using (true)
  with check (true);

insert into public.tc_site_popup (id, active, title, message, cta_label, cta_href)
values (
  1, false,
  'Welcome to Talent Crafters',
  'Explore our Career Development packages — ATS-friendly CVs for every stage of your journey.',
  'View packages', '/packages'
)
on conflict (id) do nothing;

insert into public.tc_packages (
  slug, name, subtitle, tagline, summary, price_label, includes, ideal_for,
  timeline, region, color_options, quote_amount, active, sort_order
) values
(
  'graduate-package','Graduate Package','Fresh Graduate Package',
  'ATS-friendly CV writing for Africa — start your career strong.',
  'Our Fresh Graduate Package is designed for graduates and early-career candidates applying across Africa.',
  'Request a quote',
  '["Expert ATS-friendly CV writing (optimised for screening systems)","Fresh graduate layout highlighting education, projects, and potential","Job application email template","LinkedIn optimisation","Client colour choice: Teal, Dark green, or Blue","Africa-focused application positioning"]'::jsonb,
  'Fresh graduates and early-career candidates seeking roles within Africa.',
  '10 working days','Africa only',
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"dark-green","label":"Dark green","hex":"#14532d"},{"id":"blue","label":"Blue","hex":"#1e3a5f"}]'::jsonb,
  1200, true, 1
),
(
  'professional-package','Professional Package','Professional — Package',
  'ATS-friendly CV writing for working professionals across Africa.',
  'Our Professional Package is built for experienced candidates applying within Africa.',
  'Request a quote',
  '["Turn around time 7 working days (ONLY AFRICA)","Expert ATS-FRIENDLY CV writing","Adding your email and CV into Recruiters Database","Job Application Email Template","Free Career Hunt Techniques","LinkedIn Optimization","CV Design"]'::jsonb,
  'Working professionals seeking stronger roles within Africa with recruiter-backed CV support.',
  '7 working days','Africa only',
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"blue","label":"Blue","hex":"#1a4b8c"},{"id":"navy","label":"Navy","hex":"#0a2540"},{"id":"dark-grey","label":"Dark grey","hex":"#3a3f47"}]'::jsonb,
  1800, true, 2
),
(
  'executive-package','Executive Package','Executive — Package',
  'Senior ATS-friendly CV writing for executives across Africa.',
  'Our Executive Package is built for senior leaders applying within Africa.',
  'Request a quote',
  '["Turn around time 5 working days (ONLY AFRICA)","Expert ATS-FRIENDLY CV writing","Adding your email and CV into Recruiters Database","Job Application Email Template","Free Career Hunt Techniques","Free salary negotiation Template","Free help with job placements","Submitting your CV and cover letter to potential Recruiters and hiring managers","Interview preparation","Cover letter writing","LinkedIn Optimisation"]'::jsonb,
  'Senior professionals, managers, and executives competing for high-stakes roles within Africa.',
  '5 working days','Africa only',
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"navy","label":"Navy","hex":"#0a2540"},{"id":"blue","label":"Blue","hex":"#1a4b8c"},{"id":"dark-grey","label":"Dark grey","hex":"#3a3f47"}]'::jsonb,
  2500, true, 3
),
(
  'international-resume','International Resume','International — Package',
  'ATS-friendly résumé writing for international applications.',
  'Our International Package is designed for candidates applying globally.',
  'Request a quote',
  '["Turn around time 4 working days","Expert ATS-FRIENDLY Résumé writing","Adding your email and Résumé into Recruiters Database","Job Application Email Template","Free Career Hunt Techniques","Free salary negotiation Template","Free help with job placements","Submitting your Résumé and cover letter to potential Recruiters and hiring managers","Interview preparation","Cover letter writing","LinkedIn Optimisation","Résumé design"]'::jsonb,
  'Professionals applying for roles outside South Africa who need an internationally styled résumé.',
  '4 working days', null,
  '[{"id":"teal","label":"Teal","hex":"#0d9488"},{"id":"navy","label":"Navy","hex":"#0a2540"},{"id":"blue","label":"Blue","hex":"#1a4b8c"},{"id":"dark-grey","label":"Dark grey","hex":"#3a3f47"}]'::jsonb,
  2200, true, 4
)
on conflict (slug) do nothing;
-- END .tmp-sb-extract\003_talent_crafters_policies_seed.sql

-- BEGIN .tmp-sb-extract\005_talent_crafters_widen_select.sql
-- name: talent_crafters_widen_select
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

drop policy if exists "tc_packages_public_read" on public.tc_packages;
create policy "tc_packages_public_read"
  on public.tc_packages for select
  to anon, authenticated
  using (true);

drop policy if exists "tc_popup_public_read" on public.tc_site_popup;
create policy "tc_popup_public_read"
  on public.tc_site_popup for select
  to anon, authenticated
  using (true);

-- Admin/server writes when using the service role key (bypasses RLS).
-- Temporary anon write policies are intentionally omitted.
-- END .tmp-sb-extract\005_talent_crafters_widen_select.sql

-- BEGIN .tmp-sb-extract\021_tc_recruiters_job_posts.sql
-- name: tc_recruiters_job_posts
-- tool: CallMcpTool
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

create extension if not exists pgcrypto;

create table if not exists public.tc_recruiters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  company text not null,
  whatsapp text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.tc_job_posts (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.tc_recruiters(id) on delete cascade,
  title text not null,
  company_name text not null,
  location text not null,
  employment_type text not null check (employment_type in ('full-time','part-time','contract','remote')),
  description text not null,
  requirements text not null default '',
  salary_label text,
  status text not null default 'pending' check (status in ('pending','published','rejected','closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists tc_job_posts_status_idx on public.tc_job_posts(status, created_at desc);
create index if not exists tc_job_posts_recruiter_idx on public.tc_job_posts(recruiter_id, created_at desc);
create index if not exists tc_recruiters_email_idx on public.tc_recruiters(email);

alter table public.tc_recruiters enable row level security;
alter table public.tc_job_posts enable row level security;

drop policy if exists tc_job_posts_public_published on public.tc_job_posts;
create policy tc_job_posts_public_published on public.tc_job_posts
  for select using (status = 'published');

-- END .tmp-sb-extract\021_tc_recruiters_job_posts.sql

-- BEGIN .tmp-sb-extract\022_tc_job_posts_contact_email.sql
-- name: tc_job_posts_contact_email
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

alter table public.tc_job_posts add column if not exists contact_email text;
-- END .tmp-sb-extract\022_tc_job_posts_contact_email.sql

-- BEGIN .tmp-sb-extract\023_tc_recruiters_verification_logo.sql
-- name: tc_recruiters_verification_logo
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

alter table public.tc_recruiters
  add column if not exists logo_url text,
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  add column if not exists verified_at timestamptz,
  add column if not exists verification_note text;

alter table public.tc_job_posts
  add column if not exists company_logo_url text;
-- END .tmp-sb-extract\023_tc_recruiters_verification_logo.sql

-- BEGIN .tmp-sb-extract\027_tc_package_admin_write_rpc.sql
-- name: tc_package_admin_write_rpc
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

create table if not exists public.tc_app_secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.tc_app_secrets enable row level security;

-- No policies: only service role / security definer can read secrets.

create or replace function public.tc_upsert_package(
  payload jsonb,
  write_key text
)
returns public.tc_packages
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
  result public.tc_packages;
  sort_ord int;
begin
  select value into expected from public.tc_app_secrets where name = 'package_write';
  if expected is null or write_key is null or write_key <> expected then
    raise exception 'unauthorized';
  end if;

  select sort_order into sort_ord
  from public.tc_packages
  where slug = coalesce(payload->>'slug', '');

  if sort_ord is null then
    select coalesce(max(sort_order), 0) + 1 into sort_ord from public.tc_packages;
  end if;

  insert into public.tc_packages as p (
    slug, name, subtitle, tagline, summary, price_label, includes, ideal_for,
    timeline, region, color_options, sample_image, quote_amount, active, sort_order, updated_at
  )
  values (
    payload->>'slug',
    payload->>'name',
    nullif(payload->>'subtitle', ''),
    payload->>'tagline',
    payload->>'summary',
    payload->>'price_label',
    coalesce(payload->'includes', '[]'::jsonb),
    payload->>'ideal_for',
    payload->>'timeline',
    nullif(payload->>'region', ''),
    payload->'color_options',
    nullif(payload->>'sample_image', ''),
    coalesce((payload->>'quote_amount')::numeric, 0),
    coalesce((payload->>'active')::boolean, true),
    sort_ord,
    now()
  )
  on conflict (slug) do update set
    name = excluded.name,
    subtitle = excluded.subtitle,
    tagline = excluded.tagline,
    summary = excluded.summary,
    price_label = excluded.price_label,
    includes = excluded.includes,
    ideal_for = excluded.ideal_for,
    timeline = excluded.timeline,
    region = excluded.region,
    color_options = excluded.color_options,
    sample_image = excluded.sample_image,
    quote_amount = excluded.quote_amount,
    active = excluded.active,
    updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.tc_delete_package(
  p_slug text,
  write_key text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
  removed int;
begin
  select value into expected from public.tc_app_secrets where name = 'package_write';
  if expected is null or write_key is null or write_key <> expected then
    raise exception 'unauthorized';
  end if;

  delete from public.tc_packages where slug = p_slug;
  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;

revoke all on function public.tc_upsert_package(jsonb, text) from public;
revoke all on function public.tc_delete_package(text, text) from public;
grant execute on function public.tc_upsert_package(jsonb, text) to anon, authenticated, service_role;
grant execute on function public.tc_delete_package(text, text) to anon, authenticated, service_role;
-- END .tmp-sb-extract\027_tc_package_admin_write_rpc.sql

-- BEGIN .tmp-sb-extract\032_tc_orders_write_rpc_and_number.sql
-- name: tc_orders_write_rpc_and_number
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

alter table public.tc_orders add column if not exists order_number text;

create unique index if not exists tc_orders_order_number_uidx
  on public.tc_orders (order_number)
  where order_number is not null;

create sequence if not exists public.tc_order_number_seq start 1001;

-- Backfill any existing rows without a number
update public.tc_orders
set order_number = 'TC-' || lpad(nextval('public.tc_order_number_seq')::text, 5, '0')
where order_number is null;

create or replace function public.tc_create_checkout_order(
  payload jsonb,
  write_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
  new_id text;
  new_number text;
  cust_id text;
  existing_orders int;
begin
  select value into expected from public.tc_app_secrets where name = 'package_write';
  if expected is null or write_key is null or write_key <> expected then
    raise exception 'unauthorized';
  end if;

  new_id := coalesce(nullif(payload->>'id', ''), 'ord_' || extract(epoch from now())::bigint::text);
  new_number := 'TC-' || lpad(nextval('public.tc_order_number_seq')::text, 5, '0');

  insert into public.tc_orders (
    id, created_at, completed_at, first_name, surname, email, whatsapp,
    location, country, package_slug, package_name, cv_color, cv_url, picture_url,
    amount, status, assigned_writer, order_number
  ) values (
    new_id,
    coalesce((payload->>'created_at')::timestamptz, now()),
    null,
    payload->>'first_name',
    payload->>'surname',
    payload->>'email',
    payload->>'whatsapp',
    payload->>'location',
    payload->>'country',
    payload->>'package_slug',
    payload->>'package_name',
    nullif(payload->>'cv_color', ''),
    nullif(payload->>'cv_url', ''),
    nullif(payload->>'picture_url', ''),
    coalesce((payload->>'amount')::numeric, 0),
    coalesce(payload->>'status', 'pending'),
    nullif(payload->>'assigned_writer', ''),
    new_number
  );

  select id, orders into cust_id, existing_orders
  from public.tc_customers
  where lower(email) = lower(payload->>'email')
  limit 1;

  if cust_id is not null then
    update public.tc_customers
    set orders = coalesce(existing_orders, 0) + 1
    where id = cust_id;
  else
    insert into public.tc_customers (id, name, email, whatsapp, country, orders, created_at)
    values (
      'cus_' || extract(epoch from now())::bigint::text,
      coalesce(payload->>'customer_name', trim(both from (payload->>'first_name') || ' ' || (payload->>'surname'))),
      payload->>'email',
      payload->>'whatsapp',
      payload->>'country',
      1,
      now()
    );
  end if;

  return jsonb_build_object(
    'id', new_id,
    'order_number', new_number
  );
end;
$$;

revoke all on function public.tc_create_checkout_order(jsonb, text) from public;
grant execute on function public.tc_create_checkout_order(jsonb, text) to anon, authenticated, service_role;
-- END .tmp-sb-extract\032_tc_orders_write_rpc_and_number.sql

-- BEGIN .tmp-sb-extract\033_tc_orders_auto_number_trigger.sql
-- name: tc_orders_auto_number_trigger
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

create or replace function public.tc_orders_set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'TC-' || lpad(nextval('public.tc_order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tc_orders_order_number on public.tc_orders;
create trigger trg_tc_orders_order_number
before insert on public.tc_orders
for each row execute function public.tc_orders_set_order_number();
-- END .tmp-sb-extract\033_tc_orders_auto_number_trigger.sql

-- BEGIN .tmp-sb-extract\041_tc_audit_invoice_orders_admin_rpc.sql
-- name: tc_audit_invoice_orders_admin_rpc
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

-- Allow package slug renames without breaking order FKs
alter table public.tc_orders
  drop constraint if exists tc_orders_package_slug_fkey;

alter table public.tc_orders
  add constraint tc_orders_package_slug_fkey
  foreign key (package_slug) references public.tc_packages(slug)
  on update cascade
  on delete restrict;

-- System package for contact invoice requests (hidden from public catalog)
insert into public.tc_packages (
  slug, name, subtitle, tagline, summary, price_label, includes, ideal_for,
  timeline, region, color_options, sample_image, quote_amount, active, sort_order
) values (
  'invoice-request',
  'Invoice request',
  null,
  'Contact page invoice request',
  'Internal system package for Ask for invoice submissions from the contact page.',
  'Invoice',
  '[]'::jsonb,
  'Contact form invoice requests',
  '',
  null,
  null,
  null,
  0,
  false,
  999
)
on conflict (slug) do update set
  name = excluded.name,
  active = false,
  quote_amount = 0,
  updated_at = now();

-- Admin list/update via write key (works without service role)
create or replace function public.tc_assert_write_key(write_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
begin
  select value into expected from public.tc_app_secrets where name = 'package_write';
  if expected is null or write_key is null or write_key <> expected then
    raise exception 'unauthorized';
  end if;
end;
$$;

create or replace function public.tc_list_orders(write_key text)
returns setof public.tc_orders
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.tc_assert_write_key(write_key);
  return query
    select * from public.tc_orders
    order by created_at desc;
end;
$$;

create or replace function public.tc_list_customers(write_key text)
returns setof public.tc_customers
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.tc_assert_write_key(write_key);
  return query
    select * from public.tc_customers
    order by created_at desc;
end;
$$;

create or replace function public.tc_update_order_status(
  p_id text,
  p_status text,
  write_key text
)
returns public.tc_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.tc_orders;
begin
  perform public.tc_assert_write_key(write_key);
  update public.tc_orders
  set
    status = p_status,
    completed_at = case
      when p_status = 'completed' then coalesce(completed_at, now())
      else null
    end
  where id = p_id
  returning * into updated;
  return updated;
end;
$$;

grant execute on function public.tc_assert_write_key(text) to anon, authenticated;
grant execute on function public.tc_list_orders(text) to anon, authenticated;
grant execute on function public.tc_list_customers(text) to anon, authenticated;
grant execute on function public.tc_update_order_status(text, text, text) to anon, authenticated;
-- END .tmp-sb-extract\041_tc_audit_invoice_orders_admin_rpc.sql

-- BEGIN .tmp-sb-extract\045_tc_writers_and_order_assign.sql
-- name: tc_writers_and_order_assign
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

create table if not exists public.tc_writers (
  id text primary key,
  name text not null,
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tc_writers enable row level security;

drop policy if exists tc_writers_public_read on public.tc_writers;
-- writers are admin-only; no public select policy

insert into public.tc_writers (id, name, email, active) values
  ('w1', 'Sherley Dlamini', 'cvrevamping@creative-cv.co.za', true),
  ('w2', 'Thabo Molefe', 'thabo@talentcrafters.co.za', true),
  ('w3', 'Amina Hassan', 'amina@talentcrafters.co.za', true)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  active = excluded.active,
  updated_at = now();

create or replace function public.tc_list_writers(write_key text)
returns setof public.tc_writers
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.tc_assert_write_key(write_key);
  return query
    select * from public.tc_writers
    order by name asc;
end;
$$;

create or replace function public.tc_upsert_writer(payload jsonb, write_key text)
returns public.tc_writers
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.tc_writers;
  wid text;
begin
  perform public.tc_assert_write_key(write_key);
  wid := coalesce(nullif(payload->>'id', ''), 'w_' || extract(epoch from now())::bigint::text);
  insert into public.tc_writers (id, name, email, active, updated_at)
  values (
    wid,
    payload->>'name',
    lower(payload->>'email'),
    coalesce((payload->>'active')::boolean, true),
    now()
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    active = excluded.active,
    updated_at = now()
  returning * into row;
  return row;
end;
$$;

create or replace function public.tc_delete_writer(p_id text, write_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted int;
begin
  perform public.tc_assert_write_key(write_key);
  delete from public.tc_writers where id = p_id;
  get diagnostics deleted = row_count;
  return deleted > 0;
end;
$$;

create or replace function public.tc_update_order(
  p_id text,
  write_key text,
  p_status text default null,
  p_assigned_writer text default null
)
returns public.tc_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.tc_orders;
begin
  perform public.tc_assert_write_key(write_key);
  update public.tc_orders
  set
    status = coalesce(p_status, status),
    assigned_writer = case
      when p_assigned_writer is null then assigned_writer
      when p_assigned_writer = '' then null
      else p_assigned_writer
    end,
    completed_at = case
      when coalesce(p_status, status) = 'completed' then coalesce(completed_at, now())
      when p_status is not null and p_status <> 'completed' then null
      else completed_at
    end
  where id = p_id
  returning * into updated;
  return updated;
end;
$$;

grant execute on function public.tc_list_writers(text) to anon, authenticated;
grant execute on function public.tc_upsert_writer(jsonb, text) to anon, authenticated;
grant execute on function public.tc_delete_writer(text, text) to anon, authenticated;
grant execute on function public.tc_update_order(text, text, text, text) to anon, authenticated;
-- END .tmp-sb-extract\045_tc_writers_and_order_assign.sql

-- BEGIN .tmp-sb-extract\046_tc_update_order_set_writer_flag.sql
-- name: tc_update_order_set_writer_flag
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

create or replace function public.tc_update_order(
  p_id text,
  write_key text,
  p_status text default null,
  p_assigned_writer text default null,
  p_set_writer boolean default false
)
returns public.tc_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.tc_orders;
begin
  perform public.tc_assert_write_key(write_key);
  update public.tc_orders
  set
    status = coalesce(p_status, status),
    assigned_writer = case
      when p_set_writer then nullif(p_assigned_writer, '')
      else assigned_writer
    end,
    completed_at = case
      when coalesce(p_status, status) = 'completed' then coalesce(completed_at, now())
      when p_status is not null and p_status <> 'completed' then null
      else completed_at
    end
  where id = p_id
  returning * into updated;
  return updated;
end;
$$;

grant execute on function public.tc_update_order(text, text, text, text, boolean) to anon, authenticated;
-- END .tmp-sb-extract\046_tc_update_order_set_writer_flag.sql

-- BEGIN .tmp-sb-extract\049_tc_uploads_storage_bucket.sql
-- name: tc_uploads_storage_bucket
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tc-uploads',
  'tc-uploads',
  true,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Allow public read of uploaded checkout files
drop policy if exists "tc_uploads_public_read" on storage.objects;
create policy "tc_uploads_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'tc-uploads');

-- Writes only via service role (bypasses RLS); no anon insert policy
-- END .tmp-sb-extract\049_tc_uploads_storage_bucket.sql

-- BEGIN .tmp-sb-extract\050_tc_update_order_files.sql
-- name: tc_update_order_files
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

create or replace function public.tc_update_order(
  p_id text,
  write_key text,
  p_status text default null,
  p_assigned_writer text default null,
  p_set_writer boolean default false,
  p_cv_url text default null,
  p_set_cv boolean default false,
  p_picture_url text default null,
  p_set_picture boolean default false
)
returns public.tc_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.tc_orders;
begin
  perform public.tc_assert_write_key(write_key);
  update public.tc_orders
  set
    status = coalesce(p_status, status),
    assigned_writer = case
      when p_set_writer then nullif(p_assigned_writer, '')
      else assigned_writer
    end,
    cv_url = case
      when p_set_cv then nullif(p_cv_url, '')
      else cv_url
    end,
    picture_url = case
      when p_set_picture then nullif(p_picture_url, '')
      else picture_url
    end,
    completed_at = case
      when coalesce(p_status, status) = 'completed' then coalesce(completed_at, now())
      when p_status is not null and p_status <> 'completed' then null
      else completed_at
    end
  where id = p_id
  returning * into updated;
  return updated;
end;
$$;

grant execute on function public.tc_update_order(text, text, text, text, boolean, text, boolean, text, boolean) to anon, authenticated;
-- END .tmp-sb-extract\050_tc_update_order_files.sql

-- BEGIN .tmp-sb-extract\054_tc_interview_sessions.sql
-- name: tc_interview_sessions
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

-- Interview prep signups for Talent Crafters
CREATE TABLE IF NOT EXISTS public.tc_interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  surname text NOT NULL,
  position text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  interviewer text CHECK (interviewer IN ('lisa', 'clemence')),
  duration_minutes integer CHECK (duration_minutes IN (15, 30, 60)),
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'in_progress', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tc_interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.tc_register_interview_session(payload jsonb, write_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  PERFORM public.tc_assert_write_key(write_key);

  INSERT INTO public.tc_interview_sessions (
    first_name, surname, position, phone, email, status
  ) VALUES (
    trim(payload->>'first_name'),
    trim(payload->>'surname'),
    trim(payload->>'position'),
    trim(payload->>'phone'),
    lower(trim(payload->>'email')),
    coalesce(nullif(payload->>'status', ''), 'registered')
  )
  RETURNING id INTO new_id;

  RETURN jsonb_build_object('id', new_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.tc_update_interview_session(
  p_id uuid,
  write_key text,
  p_status text DEFAULT NULL,
  p_interviewer text DEFAULT NULL,
  p_duration_minutes integer DEFAULT NULL
)
RETURNS public.tc_interview_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.tc_interview_sessions;
BEGIN
  PERFORM public.tc_assert_write_key(write_key);

  UPDATE public.tc_interview_sessions
  SET
    status = coalesce(nullif(p_status, ''), status),
    interviewer = coalesce(nullif(p_interviewer, ''), interviewer),
    duration_minutes = coalesce(p_duration_minutes, duration_minutes)
  WHERE id = p_id
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'session not found';
  END IF;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tc_list_interview_sessions(write_key text)
RETURNS SETOF public.tc_interview_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.tc_assert_write_key(write_key);
  RETURN QUERY
  SELECT *
  FROM public.tc_interview_sessions
  ORDER BY created_at DESC;
END;
$function$;
-- END .tmp-sb-extract\054_tc_interview_sessions.sql

-- BEGIN .tmp-sb-extract\055_tc_interview_sessions_results.sql
-- name: tc_interview_sessions_results
-- tool: apply_migration
-- source: b0509282-4df4-4867-aa8f-56a82ea21b86\b0509282-4df4-4867-aa8f-56a82ea21b86.jsonl

ALTER TABLE public.tc_interview_sessions
  ADD COLUMN IF NOT EXISTS transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS results jsonb,
  ADD COLUMN IF NOT EXISTS overall_score integer,
  ADD COLUMN IF NOT EXISTS audio_clips jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE OR REPLACE FUNCTION public.tc_complete_interview_session(
  p_id uuid,
  write_key text,
  p_transcript jsonb,
  p_results jsonb,
  p_overall_score integer,
  p_audio_clips jsonb
)
RETURNS public.tc_interview_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.tc_interview_sessions;
BEGIN
  PERFORM public.tc_assert_write_key(write_key);

  UPDATE public.tc_interview_sessions
  SET
    status = 'completed',
    transcript = coalesce(p_transcript, '[]'::jsonb),
    results = p_results,
    overall_score = p_overall_score,
    audio_clips = coalesce(p_audio_clips, '[]'::jsonb),
    completed_at = now()
  WHERE id = p_id
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'session not found';
  END IF;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tc_get_interview_session(p_id uuid, write_key text)
RETURNS public.tc_interview_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.tc_assert_write_key(write_key);
  RETURN (
    SELECT t FROM public.tc_interview_sessions t WHERE t.id = p_id
  );
END;
$function$;
-- END .tmp-sb-extract\055_tc_interview_sessions_results.sql

-- BEGIN supabase\migrations\20260805163000_tc_uploads_public_write.sql
-- Allow checkout/admin uploads into tc-uploads when service role is unavailable.
-- Bucket already enforces a 10MB file_size_limit.

DROP POLICY IF EXISTS "tc_uploads_public_insert" ON storage.objects;
CREATE POLICY "tc_uploads_public_insert"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview')
);

DROP POLICY IF EXISTS "tc_uploads_public_update" ON storage.objects;
CREATE POLICY "tc_uploads_public_update"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview')
)
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview')
);

-- END supabase\migrations\20260805163000_tc_uploads_public_write.sql

-- BEGIN supabase\migrations\20260805170000_tc_recruiters_company_details.sql
-- Recruiter company verification details + logo upload folder support

ALTER TABLE public.tc_recruiters
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS website text;

DROP POLICY IF EXISTS "tc_uploads_public_insert" ON storage.objects;
CREATE POLICY "tc_uploads_public_insert"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview', 'recruiters')
);

DROP POLICY IF EXISTS "tc_uploads_public_update" ON storage.objects;
CREATE POLICY "tc_uploads_public_update"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview', 'recruiters')
)
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview', 'recruiters')
);

-- END supabase\migrations\20260805170000_tc_recruiters_company_details.sql

-- BEGIN supabase\migrations\20260807140000_tc_get_order.sql
-- Fetch a single checkout order by id or human order number (TC-xxxxx).
create or replace function public.tc_get_order(order_ref text, write_key text)
returns setof public.tc_orders
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public.tc_assert_write_key(write_key);
  return query
    select *
    from public.tc_orders
    where id = order_ref
       or order_number = order_ref
    limit 1;
end;
$$;

grant execute on function public.tc_get_order(text, text) to anon, authenticated;

-- END supabase\migrations\20260807140000_tc_get_order.sql

-- Complete storage support for interview recordings and ensure safe public file access.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tc-uploads', 'tc-uploads', true, 10485760,
  array[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream','image/jpeg','image/png','image/jpg','image/webp',
    'audio/webm','audio/wav','audio/mpeg','audio/mp4','audio/ogg','video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "tc_uploads_public_insert" on storage.objects;
create policy "tc_uploads_public_insert" on storage.objects
  for insert to public with check (
    bucket_id = 'tc-uploads'
    and (storage.foldername(name))[1] in
      ('checkout','invoice','orders','interview','interview-audio','recruiters')
  );

drop policy if exists "tc_uploads_public_update" on storage.objects;
create policy "tc_uploads_public_update" on storage.objects
  for update to public using (
    bucket_id = 'tc-uploads'
    and (storage.foldername(name))[1] in
      ('checkout','invoice','orders','interview','interview-audio','recruiters')
  ) with check (
    bucket_id = 'tc-uploads'
    and (storage.foldername(name))[1] in
      ('checkout','invoice','orders','interview','interview-audio','recruiters')
  );

-- Current application catalog prices.
update public.tc_packages set quote_amount = 950, updated_at = now() where slug = 'graduate-package';
update public.tc_packages set quote_amount = 1200, updated_at = now() where slug = 'professional-package';
update public.tc_packages set quote_amount = 1500, updated_at = now() where slug = 'executive-package';
update public.tc_packages set quote_amount = 2500, updated_at = now() where slug = 'international-resume';

-- The service-role-backed app can use these functions too; keep fallback grants explicit.
grant execute on function public.tc_register_interview_session(jsonb, text) to anon, authenticated;
grant execute on function public.tc_update_interview_session(uuid, text, text, text, integer) to anon, authenticated;
grant execute on function public.tc_list_interview_sessions(text) to anon, authenticated;
grant execute on function public.tc_complete_interview_session(uuid, text, jsonb, jsonb, integer, jsonb) to anon, authenticated;
grant execute on function public.tc_get_interview_session(uuid, text) to anon, authenticated;

-- The project disables automatic public-table exposure. Grant only the
-- read/write capabilities required by the public website and upload client.
grant usage on schema public to anon, authenticated;
grant select on public.tc_packages, public.tc_site_popup, public.tc_job_posts
  to anon, authenticated;
grant select, insert, update on storage.objects to anon, authenticated;
-- Service role access is intentionally explicit because the project disables
-- automatic exposure of new tables.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant select, insert, update, delete on storage.objects to service_role;
