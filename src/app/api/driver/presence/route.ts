import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to use driver mode." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`select is_online, vehicle_type, latitude, longitude, updated_at from public.driver_presence where driver_id = ${user.id} limit 1`;
    const application = await sql`select vehicle_type from public.driver_application_details where user_id = ${user.id} limit 1`;
    return NextResponse.json({ presence: rows[0] ?? { is_online: false, vehicle_type: application[0]?.vehicle_type ?? "motorcycle", latitude: null, longitude: null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load driver mode." }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to use driver mode." }, { status: 401 });
    const body = await request.json();
    const online = body.is_online === true;
    const vehicle = body.vehicle_type;
    const lat = body.latitude == null ? null : Number(body.latitude);
    const lng = body.longitude == null ? null : Number(body.longitude);
    if (!["motorcycle", "auto", "car"].includes(vehicle)) return NextResponse.json({ error: "Choose bike, auto, or car." }, { status: 400 });
    if (online && (!Number.isFinite(lat) || !Number.isFinite(lng) || lat! < -90 || lat! > 90 || lng! < -180 || lng! > 180)) return NextResponse.json({ error: "Location permission is required to go online." }, { status: 400 });
    await ensureSchema();
    const sql = getSql();
    const application = await sql`select vehicle_type, registration_number from public.driver_application_details where user_id = ${user.id} limit 1`;
    if (application[0] && application[0].vehicle_type !== vehicle) return NextResponse.json({ error: "Your selected vehicle does not match your registered vehicle. Update onboarding first." }, { status: 409 });
    if (online) {
      if (!application[0]) return NextResponse.json({ error: "Complete vehicle registration before going online." }, { status: 403 });
      const verification = await sql`select status from public.driver_verifications where user_id = ${user.id} limit 1`;
      if (verification[0]?.status !== "approved") return NextResponse.json({ error: "Driver verification must be approved before going online." }, { status: 403 });
    }
    const rows = await sql`
      insert into public.driver_presence (driver_id, is_online, vehicle_type, latitude, longitude, updated_at)
      values (${user.id}, ${online}, ${vehicle}, ${online ? lat : null}, ${online ? lng : null}, now())
      on conflict (driver_id) do update set is_online = excluded.is_online, vehicle_type = excluded.vehicle_type,
        latitude = excluded.latitude, longitude = excluded.longitude, updated_at = now()
      returning is_online, vehicle_type, latitude, longitude, updated_at
    `;
    return NextResponse.json({ presence: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to update driver mode." }, { status });
  }
}
