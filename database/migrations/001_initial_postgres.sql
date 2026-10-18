create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  email_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on public.sessions(user_id);
create index if not exists sessions_expiry_idx on public.sessions(expires_at);

create table if not exists public.email_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists email_codes_user_idx on public.email_verification_codes(user_id, created_at desc);

create table if not exists public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
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
  status text not null default 'open' check (status in ('open', 'full', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  check (lower(origin_city) <> lower(destination_city))
);
create index if not exists trips_search_idx on public.trips(origin_city, destination_city, departure_at) where status = 'open';
create index if not exists trips_driver_idx on public.trips(driver_id);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  seats_requested integer not null default 1 check (seats_requested between 1 and 8),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  unique (trip_id, passenger_id)
);
create index if not exists bookings_trip_idx on public.bookings(trip_id);
create index if not exists bookings_passenger_idx on public.bookings(passenger_id);
