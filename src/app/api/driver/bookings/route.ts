import { NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to view ride requests." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    const bookings = await sql`
      select b.id as booking_id, b.trip_id, b.seats_requested, b.status as booking_status, b.created_at,
        t.origin_city, t.destination_city, t.departure_at, t.vehicle_type, t.price_per_seat,
        p.full_name as passenger_name
      from public.bookings b
      join public.trips t on t.id = b.trip_id
      join public.profiles p on p.id = b.passenger_id
      where t.driver_id = ${user.id}
      order by case when b.status = 'pending' then 0 when b.status = 'confirmed' then 1 else 2 end, b.created_at desc
      limit 100
    `;
    return NextResponse.json({ bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load driver bookings." }, { status });
  }
}
