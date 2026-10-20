import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const sql = getSql();
    const trips = await sql`select t.id, t.driver_id, t.origin_city, t.destination_city, t.departure_at, t.vehicle_type, t.seats_available, t.price_per_seat, t.notes, p.full_name as driver_name
      from public.trips t join public.profiles p on p.id = t.driver_id
      where t.status = 'open' and t.departure_at > now() and t.seats_available > 0
      order by t.departure_at asc limit 100`;
    const user = await getCurrentUser();
    return NextResponse.json({ trips, user: user ? { id: user.id, email: user.email, full_name: user.full_name } : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("DATABASE_URL") || message.includes("Database is not configured")) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    return NextResponse.json({ error: "Unable to load journeys." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in before publishing a journey." }, { status: 401 });
    const body = await request.json();
    const origin = typeof body.origin_city === "string" ? body.origin_city.trim() : "";
    const destination = typeof body.destination_city === "string" ? body.destination_city.trim() : "";
    const departure = new Date(body.departure_at);
    const vehicle = body.vehicle_type;
    const seats = Number(body.seats_total);
    const price = Number(body.price_per_seat);
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    if (!origin || !destination || origin.length > 100 || destination.length > 100 || origin.toLowerCase() === destination.toLowerCase()) return NextResponse.json({ error: "Choose two different cities." }, { status: 400 });
    if (Number.isNaN(departure.getTime()) || departure <= new Date()) return NextResponse.json({ error: "Choose a future departure date and time." }, { status: 400 });
    if (!["car", "motorcycle"].includes(vehicle)) return NextResponse.json({ error: "Choose a valid vehicle." }, { status: 400 });
    if (!Number.isInteger(seats) || seats < 1 || seats > 8) return NextResponse.json({ error: "Seats must be between 1 and 8." }, { status: 400 });
    if (!Number.isFinite(price) || price < 0 || price > 100000) return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
    const sql = getSql();
    const verification = await sql`select status from public.driver_verifications where user_id = ${user.id} limit 1`;
    if (verification[0]?.status !== "approved") return NextResponse.json({ error: "Driver verification must be approved before publishing a journey." }, { status: 403 });
    const rows = await sql`insert into public.trips (driver_id, origin_city, destination_city, departure_at, vehicle_type, seats_total, seats_available, price_per_seat, notes, status)
      values (${user.id}, ${origin}, ${destination}, ${departure.toISOString()}, ${vehicle}, ${seats}, ${seats}, ${price}, ${notes || null}, 'open')
      returning id`;
    return NextResponse.json({ trip: rows[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTH_REQUIRED") return NextResponse.json({ error: "Please sign in before publishing a journey." }, { status: 401 });
    if (message.includes("DATABASE_URL") || message.includes("Database is not configured")) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    return NextResponse.json({ error: "Unable to publish journey." }, { status: 500 });
  }
}
