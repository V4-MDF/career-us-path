
-- ============ Roles ============
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "user reads own role" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create policy "admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============ Generic KV store ============
create table public.kv_records (
  table_name text not null,
  record_id  text not null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (table_name, record_id)
);

create index kv_records_table_idx on public.kv_records (table_name);

grant select, insert, update, delete on public.kv_records to authenticated;
grant all on public.kv_records to service_role;
grant select, insert, update on public.kv_records to anon;

alter table public.kv_records enable row level security;

-- Anon may insert only writable public collections
create policy "anon insert public writes" on public.kv_records
  for insert to anon
  with check (table_name in (
    'leads','leads_partial','sessions','prequal_responses','ab_stats'
  ));

-- Anon may update rows they legitimately re-write (upserts for sessions, partial leads, AB stats)
create policy "anon update rolling collections" on public.kv_records
  for update to anon
  using (table_name in ('sessions','ab_stats','leads_partial'))
  with check (table_name in ('sessions','ab_stats','leads_partial'));

-- Anon may read only public site content
create policy "anon read public content" on public.kv_records
  for select to anon
  using (table_name in (
    'site_content','segments','hero_variants','settings',
    'page_seo','media','page_sections','blog_posts'
  ));

-- Authenticated users can read the same public content
create policy "auth read public content" on public.kv_records
  for select to authenticated
  using (table_name in (
    'site_content','segments','hero_variants','settings',
    'page_seo','media','page_sections','blog_posts'
  ));

-- Admins can do anything
create policy "admins full kv" on public.kv_records
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger kv_records_touch
  before update on public.kv_records
  for each row execute function public.touch_updated_at();
