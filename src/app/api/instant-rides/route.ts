import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(bLat - aLat);
  const dLng = radians(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to view your rides." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    const rides = await sql`
      select r.*, p.full_name as driver_name,
        dp.latitude as driver_latitude, dp.longitude as driver_longitude
      from public.instant_rides r
      left join public.profiles p on p.id = r.driver_id
      left join public.driver_presence dp on dp.driver_id = r.driver_id
      where r.passenger_id = ${user.id}
      order by r.created_at desc limit 30
    `;
    return NextResponse.json({ rides });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load your rides." }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in before requesting a ride." }, { status: 401 });
    const body = await request.json();
    const pickup = typeof body.pickup === "string" ? body.pickup.trim() : "";
    const destination = typeof body.destination === "string" ? body.destination.trim() : "";
    const vehicle = body.vehicle_type;
    const lat = Number(body.pickup_latitude);
    const lng = Number(body.pickup_longitude);
    const destLat = body.destination_latitude == null ? null : Number(body.destination_latitude);
    const destLng = body.destination_longitude == null ? null : Number(body.destination_longitude);
    if (!pickup || !destination || pickup.length > 180 || destination.length > 180) return NextResponse.json({ error: "Enter a pickup and destination (up to 180 characters each)." }, { status: 400 });
    if (!["motorcycle", "auto", "car"].includes(vehicle)) return NextResponse.json({ error: "Choose bike, auto, or car." }, { status: 400 });
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) return NextResponse.json({ error: "Allow location access so we can find nearby drivers." }, { status: 400 });
    if ((destLat !== null && (!Number.isFinite(destLat) || destLat < -90 || destLat > 90)) || (destLng !== null && (!Number.isFinite(destLng) || destLng < -180 || destLng > 180))) return NextResponse.json({ error: "Destination coordinates are invalid." }, { status: 400 });
    if ((destLat === null) !== (destLng === null)) return NextResponse.json({ error: "Provide both destination coordinates or neither." }, { status: 400 });
    const distance = destLat === null ? 5 : distanceKm(lat, lng, destLat, destLng);
    const baseFare = vehicle === "motorcycle" ? 25 : vehicle === "auto" ? 40 : 70;
    const perKm = vehicle === "motorcycle" ? 8 : vehicle === "auto" ? 13 : 18;
    const fare = Math.round((baseFare + distance * perKm) * 100) / 100;
    await ensureSchema();
    const sql = getSql();
    const created = await sql`
      insert into public.instant_rides
        (passenger_id, pickup, destination, pickup_latitude, pickup_longitude, destination_latitude, destination_longitude, vehicle_type, estimated_fare)
      values
        (${user.id}, ${pickup}, ${destination}, ${lat}, ${lng}, ${destLat}, ${destLng}, ${vehicle}, ${fare})
      returning *
    `;
    return NextResponse.json({ ride: created[0], message: "Ride request sent. Waiting for a nearby driver." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to request a ride." }, { status });
  }
}
