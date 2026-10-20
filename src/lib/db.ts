import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
const globalForPostgres = globalThis as unknown as {
  rideMitraSql?: ReturnType<typeof postgres>;
  rideMitraSchemaPromise?: Promise<void>;
};

export const sql = globalForPostgres.rideMitraSql ?? (connectionString
  ? postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === "production" ? "require" : false,
    })
  : null);

if (process.env.NODE_ENV !== "production" && sql) {
  globalForPostgres.rideMitraSql = sql;
}

export function getSql() {
  if (!sql) throw new Error("Database is not configured. Add DATABASE_URL to the RideMitra service environment.");
  return sql;
}

const schemaStatements = [
  `create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text not null unique,
    password_hash text not null,
    email_verified_at timestamptz,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists public.sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    token_hash text not null unique,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists sessions_user_idx on public.sessions(user_id)`,
  `create index if not exists sessions_expiry_idx on public.sessions(expires_at)`,
  `create table if not exists public.email_verification_codes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    code_hash text not null,
    expires_at timestamptz not null,
    attempts integer not null default 0,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists email_codes_user_idx on public.email_verification_codes(user_id, created_at desc)`,
  `create table if not exists public.profiles (
    id uuid primary key references public.users(id) on delete cascade,
    full_name text not null default '',
    home_city text,
    avatar_url text,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists public.vehicles (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references public.profiles(id) on delete cascade,
    vehicle_type text not null check (vehicle_type in ('car', 'motorcycle')),
    make text not null,
    model text not null,
    color text,
    seats integer not null default 1 check (seats between 1 and 8),
    created_at timestamptz not null default now()
  )`,
  `create table if not exists public.trips (
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
  )`,
  `create index if not exists trips_search_idx on public.trips(origin_city, destination_city, departure_at) where status = 'open'`,
  `create index if not exists trips_driver_idx on public.trips(driver_id)`,
  `create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references public.trips(id) on delete cascade,
    passenger_id uuid not null references public.profiles(id) on delete cascade,
    seats_requested integer not null default 1 check (seats_requested between 1 and 8),
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at timestamptz not null default now(),
    unique (trip_id, passenger_id)
  )`,
  `create index if not exists bookings_trip_idx on public.bookings(trip_id)`,
  `create index if not exists bookings_passenger_idx on public.bookings(passenger_id)`,
  `create table if not exists public.driver_presence (
    driver_id uuid primary key references public.profiles(id) on delete cascade,
    is_online boolean not null default false,
    vehicle_type text not null default 'motorcycle' check (vehicle_type in ('motorcycle', 'auto', 'car')),
    latitude double precision,
    longitude double precision,
    updated_at timestamptz not null default now(),
    check (latitude is null or latitude between -90 and 90),
    check (longitude is null or longitude between -180 and 180)
  )`,
  `create index if not exists driver_presence_online_idx on public.driver_presence(is_online, vehicle_type, updated_at desc)`,
  `create table if not exists public.instant_rides (
    id uuid primary key default gen_random_uuid(),
    passenger_id uuid not null references public.profiles(id) on delete cascade,
    driver_id uuid references public.profiles(id) on delete set null,
    pickup text not null,
    destination text not null,
    pickup_latitude double precision not null check (pickup_latitude between -90 and 90),
    pickup_longitude double precision not null check (pickup_longitude between -180 and 180),
    destination_latitude double precision check (destination_latitude is null or destination_latitude between -90 and 90),
    destination_longitude double precision check (destination_longitude is null or destination_longitude between -180 and 180),
    vehicle_type text not null check (vehicle_type in ('motorcycle', 'auto', 'car')),
    estimated_fare numeric(10,2) not null check (estimated_fare >= 0),
    status text not null default 'requested' check (status in ('requested', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled', 'rejected')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create index if not exists instant_rides_passenger_idx on public.instant_rides(passenger_id, created_at desc)`,
  `create index if not exists instant_rides_driver_idx on public.instant_rides(driver_id, status, created_at desc)`,
  `create index if not exists instant_rides_queue_idx on public.instant_rides(status, vehicle_type, created_at)`,
  `create table if not exists public.instant_ride_rejections (id uuid primary key default gen_random_uuid(), ride_id uuid not null references public.instant_rides(id) on delete cascade, driver_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), unique (ride_id, driver_id))`,
  `create index if not exists instant_ride_rejections_driver_idx on public.instant_ride_rejections(driver_id, created_at desc)`,
  `create table if not exists public.driver_verifications (user_id uuid primary key references public.users(id) on delete cascade, status text not null default 'pending' check (status in ('pending','approved','rejected')), rejection_reason text, reviewed_by uuid references public.users(id) on delete set null, reviewed_at timestamptz, submitted_at timestamptz not null default now(), updated_at timestamptz not null default now())`,
  `create index if not exists driver_verifications_status_idx on public.driver_verifications(status, submitted_at desc)`,
  `create table if not exists public.driver_documents (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade, document_type text not null check (document_type in ('licence','rc','insurance','selfie')), object_key text not null unique, original_name text not null, content_type text not null check (content_type in ('application/pdf','image/jpeg','image/png','image/webp')), size_bytes integer not null check (size_bytes > 0 and size_bytes <= 10485760), status text not null default 'pending' check (status in ('pending','approved','rejected')), created_at timestamptz not null default now(), unique (user_id, document_type))`,
  `create index if not exists driver_documents_user_idx on public.driver_documents(user_id, document_type)`,
];

export async function ensureSchema() {
  const db = getSql();
  if (!globalForPostgres.rideMitraSchemaPromise) {
    globalForPostgres.rideMitraSchemaPromise = (async () => {
      for (const statement of schemaStatements) await db.unsafe(statement);
    })().catch((error) => {
      globalForPostgres.rideMitraSchemaPromise = undefined;
      throw error;
    });
  }
  await globalForPostgres.rideMitraSchemaPromise;
}
