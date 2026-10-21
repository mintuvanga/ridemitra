import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ rideId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to view ride tracking." }, { status: 401 });
    const { rideId } = await context.params;
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      select r.id, r.status, r.pickup, r.destination, r.driver_id,
        dp.latitude as driver_latitude, dp.longitude as driver_longitude,
        dp.updated_at as location_updated, p.full_name as driver_name
      from public.instant_rides r
      left join public.driver_presence dp on dp.driver_id = r.driver_id
      left join public.profiles p on p.id = r.driver_id
      where r.id = ${rideId} and (r.passenger_id = ${user.id} or r.driver_id = ${user.id})
      limit 1
    `;
    const ride = rows[0];
    if (!ride) return NextResponse.json({ error: "Ride not found." }, { status: 404 });
    const active = ["accepted", "arriving", "in_progress"].includes(ride.status);
    return NextResponse.json({
      ride: {
        id: ride.id, status: ride.status, pickup: ride.pickup, destination: ride.destination,
        driver_name: ride.driver_name ?? null,
        driver_location: active && ride.driver_latitude != null && ride.driver_longitude != null
          ? { latitude: Number(ride.driver_latitude), longitude: Number(ride.driver_longitude), updated_at: ride.location_updated }
          : null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load ride tracking." }, { status });
  }
}
