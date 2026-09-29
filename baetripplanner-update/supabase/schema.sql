-- Applied to the "Baetripplanner" Supabase project via MCP on 2026-09-28.
-- Kept here as a readable backup / for `supabase db reset` in local dev.

-- ── Tables ──────────────────────────────────────────────────────────────

create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  cover_image_url text,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table trip_members (
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table field_definitions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  field_key text not null,
  field_label text not null,
  field_type text not null check (field_type in ('text','number','date','select','url','checkbox')),
  options jsonb,
  display_order int not null default 0,
  unique (trip_id, field_key)
);

create table items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day int,
  title text not null,
  start_time time,
  end_time time,
  address text,
  google_maps_url text,
  notes text,
  category text,
  budget_amount numeric(10,2),
  status text default 'planned',
  sort_order int default 0,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  label text not null,
  is_checked boolean not null default false,
  assigned_to uuid references auth.users(id)
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  file_size bigint,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (trip_id is not null or item_id is not null)
);

-- ── Row Level Security ──────────────────────────────────────────────────

alter table trips enable row level security;
alter table trip_members enable row level security;
alter table field_definitions enable row level security;
alter table items enable row level security;
alter table checklists enable row level security;
alter table checklist_items enable row level security;
alter table attachments enable row level security;

create or replace function is_trip_member(_trip_id uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (
    select 1 from trip_members m where m.trip_id = _trip_id and m.user_id = auth.uid()
  ) or exists (
    select 1 from trips t where t.id = _trip_id and t.created_by = auth.uid()
  );
$$;

create policy "select trips" on trips for select using (is_trip_member(id));
-- Extra, non-function-based SELECT policy for a trip's own creator. Needed
-- because `insert ... select()` (PostgREST's INSERT+RETURNING) evaluates the
-- SELECT policy against the just-inserted, not-yet-committed row using the
-- STABLE is_trip_member() function's own snapshot, which does not reliably
-- see that row yet and caused "new row violates row-level security policy"
-- on every trip creation. Multiple PERMISSIVE policies are OR'd, so this one
-- covers trip creation while is_trip_member() still covers shared members.
create policy "select own trips" on trips for select using (created_by = auth.uid());
create policy "insert trips" on trips for insert with check (created_by = auth.uid());
create policy "update trips" on trips for update using (is_trip_member(id));
create policy "delete trips" on trips for delete using (created_by = auth.uid());

create policy "select members" on trip_members for select using (is_trip_member(trip_id));
create policy "insert members" on trip_members for insert with check (is_trip_member(trip_id));
create policy "delete members" on trip_members for delete using (is_trip_member(trip_id));

create policy "manage fields" on field_definitions for all using (is_trip_member(trip_id)) with check (is_trip_member(trip_id));
create policy "manage items" on items for all using (is_trip_member(trip_id)) with check (is_trip_member(trip_id));
create policy "manage checklists" on checklists for all using (is_trip_member(trip_id)) with check (is_trip_member(trip_id));

create policy "manage checklist items" on checklist_items for all using (
  exists (select 1 from checklists c where c.id = checklist_id and is_trip_member(c.trip_id))
) with check (
  exists (select 1 from checklists c where c.id = checklist_id and is_trip_member(c.trip_id))
);

create policy "manage attachments" on attachments for all using (
  (trip_id is not null and is_trip_member(trip_id)) or
  (item_id is not null and exists (select 1 from items i where i.id = item_id and is_trip_member(i.trip_id)))
) with check (
  (trip_id is not null and is_trip_member(trip_id)) or
  (item_id is not null and exists (select 1 from items i where i.id = item_id and is_trip_member(i.trip_id)))
);

-- ── Storage ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('trip-attachments', 'trip-attachments', true)
on conflict (id) do nothing;

create policy "public read trip-attachments"
on storage.objects for select
using (bucket_id = 'trip-attachments');

create policy "authenticated upload trip-attachments"
on storage.objects for insert
with check (bucket_id = 'trip-attachments' and auth.role() = 'authenticated');

create policy "authenticated update trip-attachments"
on storage.objects for update
using (bucket_id = 'trip-attachments' and auth.role() = 'authenticated');

create policy "authenticated delete trip-attachments"
on storage.objects for delete
using (bucket_id = 'trip-attachments' and auth.role() = 'authenticated');
