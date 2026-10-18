import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to see your seat requests." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    const bookings = await sql`select b.id, b.trip_id, b.passenger_id, b.seats_requested, b.status, b.created_at,
      case when t.id is null then null else json_build_object(
        'origin_city', t.origin_city,
        'destination_city', t.destination_city,
        'departure_at', t.departure_at,
        'vehicle_type', t.vehicle_type,
        'price_per_seat', t.price_per_seat
      ) end as trip
      from public.bookings b left join public.trips t on t.id = b.trip_id
      where b.passenger_id = ${user.id}
      order by b.created_at desc limit 100`;
    return NextResponse.json({ bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("DATABASE_URL") || message.includes("Database is not configured")) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    return NextResponse.json({ error: "Unable to load your bookings." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in before requesting a seat." }, { status: 401 });
    const body = await request.json();
    const tripId = typeof body.trip_id === "string" ? body.trip_id : "";
    if (!tripId) return NextResponse.json({ error: "Journey not found." }, { status: 400 });
    const sql = getSql();
    const rows = await sql.begin(async (tx) => {
      const trips = await tx`select id, driver_id, seats_available, status, departure_at from public.trips where id = ${tripId} for update`;
      const trip = trips[0];
      if (!trip || trip.status !== "open" || new Date(trip.departure_at) <= new Date() || Number(trip.seats_available) < 1) throw new Error("TRIP_UNAVAILABLE");
      if (trip.driver_id === user.id) throw new Error("OWN_TRIP");
      const existing = await tx`select id from public.bookings where trip_id = ${tripId} and passenger_id = ${user.id} limit 1`;
      if (existing[0]) throw new Error("ALREADY_BOOKED");
      const booking = await tx`insert into public.bookings (trip_id, passenger_id, seats_requested, status) values (${tripId}, ${user.id}, 1, 'pending') returning id`;
      return booking[0];
    });
    return NextResponse.json({ booking: rows, message: "Seat request sent! Waiting for driver confirmation." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTH_REQUIRED") return NextResponse.json({ error: "Please sign in before requesting a seat." }, { status: 401 });
    if (message === "ALREADY_BOOKED") return NextResponse.json({ error: "You have already requested this journey." }, { status: 409 });
    if (message === "OWN_TRIP") return NextResponse.json({ error: "You cannot request your own journey." }, { status: 400 });
    if (message === "TRIP_UNAVAILABLE") return NextResponse.json({ error: "This journey is no longer available." }, { status: 409 });
    if (message.includes("DATABASE_URL") || message.includes("Database is not configured")) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    return NextResponse.json({ error: "Unable to send request." }, { status: 500 });
  }
}
