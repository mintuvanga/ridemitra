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
    const [summaryRows, rides] = await Promise.all([
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
        select id, pickup, destination, vehicle_type, estimated_fare, updated_at
        from public.instant_rides
        where driver_id = ${user.id} and status = 'completed'
        order by updated_at desc
        limit 50
      `
    ]);
    const summary = summaryRows[0] ?? {};
    return NextResponse.json({
      summary: {
        total_estimated_fare: Number(summary.total_estimated_fare ?? 0),
        this_week_estimated_fare: Number(summary.this_week_estimated_fare ?? 0),
        completed_rides: Number(summary.completed_rides ?? 0),
        completed_rides_this_week: Number(summary.completed_rides_this_week ?? 0)
      },
      rides
    });
  } catch {
    return NextResponse.json({ error: "Unable to load your completed ride summary." }, { status: 500 });
  }
}
