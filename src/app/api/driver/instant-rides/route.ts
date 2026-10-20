import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(bLat - aLat), dLng = radians(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to receive ride requests." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      select r.*, p.full_name as passenger_name,
        (6371 * 2 * asin(sqrt(least(1, power(sin(radians(dp.latitude - r.pickup_latitude) / 2), 2)
          + cos(radians(r.pickup_latitude)) * cos(radians(dp.latitude))
          * power(sin(radians(dp.longitude - r.pickup_longitude) / 2), 2))))) as pickup_distance_km
      from public.instant_rides r
      join public.driver_presence dp on dp.driver_id = ${user.id}
      join public.profiles p on p.id = r.passenger_id
      where dp.is_online = true and dp.updated_at > now() - interval '2 minutes'
        and r.status = 'requested' and r.vehicle_type = dp.vehicle_type and r.passenger_id <> ${user.id}
        and not exists (select 1 from public.instant_ride_rejections rr where rr.ride_id = r.id and rr.driver_id = ${user.id})
        and (6371 * 2 * asin(sqrt(least(1, power(sin(radians(dp.latitude - r.pickup_latitude) / 2), 2)
          + cos(radians(r.pickup_latitude)) * cos(radians(dp.latitude))
          * power(sin(radians(dp.longitude - r.pickup_longitude) / 2), 2))))) <= 15
      order by r.created_at asc limit 50
    `;
    const active = await sql`
      select r.*, p.full_name as passenger_name
      from public.instant_rides r join public.profiles p on p.id = r.passenger_id
      where r.driver_id = ${user.id} and r.status in ('accepted', 'arriving', 'in_progress')
      order by r.updated_at desc limit 20
    `;
    return NextResponse.json({ requests: rows, active });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load ride requests." }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to update rides." }, { status: 401 });
    const body = await request.json();
    const id = typeof body.ride_id === "string" ? body.ride_id : "";
    const action = body.action;
    if (!id || !["accept", "reject", "arriving", "start", "complete"].includes(action)) return NextResponse.json({ error: "Invalid ride action." }, { status: 400 });
    await ensureSchema();
    const sql = getSql();
    if (action === "accept") {
      const verification = await sql`select status from public.driver_verifications where user_id = ${user.id} limit 1`;
      if (verification[0]?.status !== "approved") return NextResponse.json({ error: "Driver verification must be approved before accepting rides." }, { status: 403 });
    }
    const updated = await sql.begin(async (tx) => {
      const rows = await tx`
        select r.*, dp.is_online, dp.vehicle_type as driver_vehicle, dp.latitude as driver_latitude, dp.longitude as driver_longitude, dp.updated_at as location_updated
        from public.instant_rides r join public.driver_presence dp on dp.driver_id = ${user.id}
        where r.id = ${id} for update of r
      `;
      const ride = rows[0];
      if (!ride || ride.passenger_id === user.id) throw new Error("RIDE_NOT_FOUND");
      if (action === "accept" || action === "reject") {
        if (ride.status !== "requested") throw new Error("RIDE_NOT_AVAILABLE");
        if (!ride.is_online || ride.location_updated < new Date(Date.now() - 120000)) throw new Error("DRIVER_OFFLINE");
        if (ride.driver_vehicle !== ride.vehicle_type) throw new Error("VEHICLE_MISMATCH");
        const distance = distanceKm(Number(ride.driver_latitude), Number(ride.driver_longitude), Number(ride.pickup_latitude), Number(ride.pickup_longitude));
        if (distance > 15) throw new Error("TOO_FAR");
        if (action === "reject") {
          await tx`insert into public.instant_ride_rejections (ride_id, driver_id) values (${id}, ${user.id}) on conflict (ride_id, driver_id) do nothing`;
        } else {
          const taken = await tx`update public.instant_rides set status = 'accepted', driver_id = ${user.id}, updated_at = now() where id = ${id} and status = 'requested' returning id`;
          if (!taken[0]) throw new Error("RIDE_NOT_AVAILABLE");
        }
      } else {
        if (ride.driver_id !== user.id) throw new Error("RIDE_NOT_FOUND");
        const expected = action === "arriving" ? "accepted" : action === "start" ? "arriving" : "in_progress";
        const next = action === "arriving" ? "arriving" : action === "start" ? "in_progress" : "completed";
        if (ride.status !== expected) throw new Error("INVALID_RIDE_STAGE");
        await tx`update public.instant_rides set status = ${next}, updated_at = now() where id = ${id}`;
      }
      const finalRows = await tx`select id, status, driver_id, updated_at from public.instant_rides where id = ${id}`;
      return finalRows[0];
    });
    return NextResponse.json({ ride: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const map: Record<string, [number, string]> = {
      RIDE_NOT_FOUND: [404, "Ride not found."],
      RIDE_NOT_AVAILABLE: [409, "This ride request has already been handled."],
      DRIVER_OFFLINE: [409, "Go online and refresh your location first."],
      VEHICLE_MISMATCH: [409, "Your online vehicle does not match this request."],
      TOO_FAR: [409, "This request is outside the 15 km matching radius."],
      INVALID_RIDE_STAGE: [409, "This ride cannot move to that status yet."],
    };
    if (map[message]) return NextResponse.json({ error: map[message][1] }, { status: map[message][0] });
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to update ride." }, { status });
  }
}
