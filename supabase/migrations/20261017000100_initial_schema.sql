create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  home_city text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_type text not null check (vehicle_type in ('car', 'motorcycle')),
  make text not null,
  model text not null,
  color text,
  seats integer not null default 1 check (seats between 1 and 8),
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  vehicle_type text not null check (vehicle_type in ('car', 'motorcycle')),
  origin_city text not null,
  destination_city text not null,
  departure_at timestamptz not null,
  seats_total integer not null check (seats_total between 1 and 8),
  seats_available integer not null check (seats_available between 0 and seats_total),
  price_per_seat numeric(10,2) not null default 0 check (price_per_seat >= 0),
  notes text,
  status text not null default 'open'
    check (status in ('open', 'full', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  check (lower(origin_city) <> lower(destination_city))
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  seats_requested integer not null default 1 check (seats_requested between 1 and 8),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  unique (trip_id, passenger_id)
);

create index if not exists trips_search_idx
  on public.trips (origin_city, destination_city, departure_at)
  where status = 'open';

create index if not exists trips_driver_idx on public.trips (driver_id);
create index if not exists bookings_trip_idx on public.bookings (trip_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.bookings enable row level security;

create policy "Signed-in users can read profiles"
on public.profiles for select to authenticated
using (auth.uid() is not null);

create policy "Users update own profile"
on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

create policy "Signed-in users can read vehicles"
on public.vehicles for select to authenticated
using (auth.uid() is not null);

create policy "Users add own vehicles"
on public.vehicles for insert to authenticated
with check (owner_id = auth.uid());

create policy "Users update own vehicles"
on public.vehicles for update to authenticated
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users see available trips and own trips"
on public.trips for select to authenticated
using (driver_id = auth.uid() or (status = 'open' and departure_at > now()));

create policy "Users publish own trips"
on public.trips for insert to authenticated
with check (driver_id = auth.uid());

create policy "Drivers update own trips"
on public.trips for update to authenticated
using (driver_id = auth.uid()) with check (driver_id = auth.uid());

create policy "Passengers and drivers see bookings"
on public.bookings for select to authenticated
using (
  passenger_id = auth.uid()
  or exists (
    select 1 from public.trips t
    where t.id = trip_id and t.driver_id = auth.uid()
  )
);

create policy "Passengers request available trips"
on public.bookings for insert to authenticated
with check (
  passenger_id = auth.uid()
  and exists (
    select 1 from public.trips t
    where t.id = trip_id
      and t.status = 'open'
      and t.departure_at > now()
      and t.driver_id <> auth.uid()
      and seats_requested <= t.seats_available
  )
);
