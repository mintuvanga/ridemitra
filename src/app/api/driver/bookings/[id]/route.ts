import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to view this ride." }, { status: 401 });
    await ensureSchema();
    const { id } = await context.params;
    const sql = getSql();
    const rows = await sql`
      select b.id as booking_id, b.trip_id, b.seats_requested, b.status as booking_status, b.created_at,
        t.origin_city, t.destination_city, t.departure_at, t.vehicle_type, t.price_per_seat,
        p.full_name as passenger_name
      from public.bookings b
      join public.trips t on t.id = b.trip_id
      join public.profiles p on p.id = b.passenger_id
      where b.id = ${id} and t.driver_id = ${user.id}
      limit 1
    `;
    if (!rows[0]) return NextResponse.json({ error: "Ride request not found." }, { status: 404 });
    return NextResponse.json({ booking: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load this ride." }, { status });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to update this ride." }, { status: 401 });
    const body = await request.json();
    const action = body.action;
    if (!["accept", "reject", "complete"].includes(action)) {
      return NextResponse.json({ error: "Choose accept, reject, or complete." }, { status: 400 });
    }
    await ensureSchema();
    const { id } = await context.params;
    const sql = getSql();
    if (action === "accept") {
      const verification = await sql`select status from public.driver_verifications where user_id = ${user.id} limit 1`;
      if (verification[0]?.status !== "approved") {
        return NextResponse.json({ error: "Driver verification must be approved before accepting passenger bookings." }, { status: 403 });
      }
    }
    const result = await sql.begin(async (tx) => {
      const rows = await tx`
        select b.id, b.status, b.trip_id, b.seats_requested, t.driver_id, t.seats_available
        from public.bookings b join public.trips t on t.id = b.trip_id
        where b.id = ${id} for update of b, t
      `;
      const booking = rows[0];
      if (!booking || booking.driver_id !== user.id) throw new Error("RIDE_NOT_FOUND");
      if (action === "accept") {
        if (booking.status !== "pending") throw new Error("RIDE_NOT_PENDING");
        if (Number(booking.seats_available) < Number(booking.seats_requested)) throw new Error("NO_SEATS");
        await tx`update public.bookings set status = 'confirmed' where id = ${id}`;
        await tx`update public.trips set seats_available = seats_available - ${booking.seats_requested}, status = case when seats_available - ${booking.seats_requested} <= 0 then 'full' else status end where id = ${booking.trip_id}`;
      } else if (action === "reject") {
        if (booking.status !== "pending") throw new Error("RIDE_NOT_PENDING");
        await tx`update public.bookings set status = 'cancelled' where id = ${id}`;
      } else {
        if (booking.status !== "confirmed") throw new Error("RIDE_NOT_CONFIRMED");
        await tx`update public.bookings set status = 'completed', completed_at = now() where id = ${id}`;
      }
      return { id, status: action === "accept" ? "confirmed" : action === "reject" ? "cancelled" : "completed" };
    });
    return NextResponse.json({ booking: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const known: Record<string, { status: number; error: string }> = {
      RIDE_NOT_FOUND: { status: 404, error: "Ride request not found." },
      RIDE_NOT_PENDING: { status: 409, error: "This ride request is no longer pending." },
      NO_SEATS: { status: 409, error: "There are not enough seats available." },
      RIDE_NOT_CONFIRMED: { status: 409, error: "Only an accepted ride can be completed." },
      AUTH_REQUIRED: { status: 401, error: "Sign in to update this ride." },
    };
    if (known[message]) return NextResponse.json({ error: known[message].error }, { status: known[message].status });
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to update this ride." }, { status });
  }
}
