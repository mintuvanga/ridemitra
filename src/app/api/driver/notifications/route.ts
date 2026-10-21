import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema, getSql } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
 const user=await getCurrentUser();
 if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 await ensureSchema();
 const db=getSql();
 const rows=await db`select id, pickup, destination, status, updated_at from public.instant_rides where driver_id=${user.id} order by updated_at desc limit 20`;
 const bookings=await db`select b.id,b.status,b.created_at,t.origin_city,t.destination_city from public.bookings b join public.trips t on t.id=b.trip_id where t.driver_id=${user.id} order by b.created_at desc limit 20`;
 return NextResponse.json({rides:rows,bookings});
}
