import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to manage your journeys." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    const trips = await sql`
      select t.id, t.origin_city, t.destination_city, t.departure_at, t.vehicle_type,
        t.seats_total, t.seats_available, t.price_per_seat, t.notes, t.status, t.created_at,
        (select count(*)::int from public.bookings b where b.trip_id = t.id and b.status = 'pending') as pending_requests,
        (select count(*)::int from public.bookings b where b.trip_id = t.id and b.status = 'confirmed') as confirmed_bookings
      from public.trips t
      where t.driver_id = ${user.id}
      order by t.departure_at desc
      limit 100
    `;
    return NextResponse.json({ trips });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load your journeys." }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to manage your journeys." }, { status: 401 });
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id || body.action !== "cancel") return NextResponse.json({ error: "Choose a journey and a valid action." }, { status: 400 });
    await ensureSchema();
    const sql = getSql();
    const result = await sql.begin(async (tx) => {
      const rows = await tx`select id, driver_id, status, departure_at from public.trips where id = ${id} for update`;
      const trip = rows[0];
      if (!trip || trip.driver_id !== user.id) throw new Error("TRIP_NOT_FOUND");
      if (trip.status === "cancelled" || trip.status === "completed" || new Date(trip.departure_at).getTime() <= Date.now()) throw new Error("TRIP_NOT_CANCELLABLE");
      const bookings = await tx`select count(*)::int as count from public.bookings where trip_id = ${id} and status = 'confirmed'`;
      if (Number(bookings[0]?.count ?? 0) > 0) throw new Error("CONFIRMED_BOOKINGS_EXIST");
      await tx`update public.trips set status = 'cancelled' where id = ${id}`;
      await tx`update public.bookings set status = 'cancelled' where trip_id = ${id} and status = 'pending'`;
      return { id, status: "cancelled" };
    });
    return NextResponse.json({ trip: result, message: "Journey cancelled. Pending seat requests were closed." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const known: Record<string, { status: number; error: string }> = {
      TRIP_NOT_FOUND: { status: 404, error: "Journey not found." },
      TRIP_NOT_CANCELLABLE: { status: 409, error: "This journey has already departed or is already closed." },
      CONFIRMED_BOOKINGS_EXIST: { status: 409, error: "This journey has confirmed passengers. Contact them before changing the trip." },
      AUTH_REQUIRED: { status: 401, error: "Sign in to manage your journeys." },
    };
    if (known[message]) return NextResponse.json({ error: known[message].error }, { status: known[message].status });
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to update this journey." }, { status });
  }
}
