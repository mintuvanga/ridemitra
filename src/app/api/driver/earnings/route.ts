import { NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to view your ride summary." }, { status: 401 });

    await ensureSchema();
    const sql = getSql();
    const [instantSummaryRows, bookingSummaryRows, instantRides, bookingRides] = await Promise.all([
      sql`
        select
          coalesce(sum(estimated_fare), 0) as total_estimated_fare,
          coalesce(sum(estimated_fare) filter (where updated_at >= date_trunc('week', now())), 0) as this_week_estimated_fare,
          count(*)::int as completed_rides,
          count(*) filter (where updated_at >= date_trunc('week', now()))::int as completed_rides_this_week
        from public.instant_rides
        where driver_id = ${user.id} and status = 'completed'
      `,
      sql`
        select
          coalesce(sum(t.price_per_seat * b.seats_requested), 0) as total_estimated_fare,
          coalesce(sum(t.price_per_seat * b.seats_requested) filter (where b.completed_at >= date_trunc('week', now())), 0) as this_week_estimated_fare,
          count(*)::int as completed_rides,
          count(*) filter (where b.completed_at >= date_trunc('week', now()))::int as completed_rides_this_week
        from public.bookings b
        join public.trips t on t.id = b.trip_id
        where t.driver_id = ${user.id} and b.status = 'completed'
      `,
      sql`
        select id, pickup, destination, vehicle_type, estimated_fare, updated_at as completed_at,
          'instant'::text as source
        from public.instant_rides
        where driver_id = ${user.id} and status = 'completed'
        order by updated_at desc
        limit 50
      `,
      sql`
        select b.id, t.origin_city as pickup, t.destination_city as destination,
          t.vehicle_type, (t.price_per_seat * b.seats_requested) as estimated_fare,
          coalesce(b.completed_at, t.departure_at, b.created_at) as completed_at,
          'journey'::text as source
        from public.bookings b
        join public.trips t on t.id = b.trip_id
        where t.driver_id = ${user.id} and b.status = 'completed'
        order by coalesce(b.completed_at, t.departure_at, b.created_at) desc
        limit 50
      `
    ]);

    const instantSummary = instantSummaryRows[0] ?? {};
    const bookingSummary = bookingSummaryRows[0] ?? {};
    const rides = [...instantRides, ...bookingRides]
      .sort((a, b) => new Date(String(b.completed_at)).getTime() - new Date(String(a.completed_at)).getTime())
      .slice(0, 50);

    return NextResponse.json({
      summary: {
        total_estimated_fare: Number(instantSummary.total_estimated_fare ?? 0) + Number(bookingSummary.total_estimated_fare ?? 0),
        this_week_estimated_fare: Number(instantSummary.this_week_estimated_fare ?? 0) + Number(bookingSummary.this_week_estimated_fare ?? 0),
        completed_rides: Number(instantSummary.completed_rides ?? 0) + Number(bookingSummary.completed_rides ?? 0),
        completed_rides_this_week: Number(instantSummary.completed_rides_this_week ?? 0) + Number(bookingSummary.completed_rides_this_week ?? 0)
      },
      rides
    });
  } catch {
    return NextResponse.json({ error: "Unable to load your completed ride summary." }, { status: 500 });
  }
}
