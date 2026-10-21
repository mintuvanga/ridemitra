import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function databaseError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
  return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to access your vehicle application." }, { status });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in to manage driver onboarding." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`select vehicle_type, registration_number, vehicle_make, vehicle_model, vehicle_color, city, updated_at from public.driver_application_details where user_id = ${user.id} limit 1`;
    const verification = await sql`select status, rejection_reason, submitted_at from public.driver_verifications where user_id = ${user.id} limit 1`;
    const documents = await sql`select document_type, status from public.driver_documents where user_id = ${user.id}`;
    return NextResponse.json({ application: rows[0] ?? null, verification: verification[0] ?? { status: "not_submitted", rejection_reason: null, submitted_at: null }, documents });
  } catch (error) {
    return databaseError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please sign in to save driver onboarding." }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Enter valid vehicle details." }, { status: 400 });

    const vehicleType = body.vehicle_type;
    const registration = typeof body.registration_number === "string" ? body.registration_number.trim().toUpperCase().replace(/\\s+/g, " ") : "";
    const make = typeof body.vehicle_make === "string" ? body.vehicle_make.trim().replace(/\\s+/g, " ") : "";
    const model = typeof body.vehicle_model === "string" ? body.vehicle_model.trim().replace(/\\s+/g, " ") : "";
    const color = typeof body.vehicle_color === "string" ? body.vehicle_color.trim().replace(/\\s+/g, " ") : "";
    const city = typeof body.city === "string" ? body.city.trim().replace(/\\s+/g, " ") : "";

    if (!["motorcycle", "auto", "car"].includes(vehicleType)) return NextResponse.json({ error: "Choose Bike, Auto, or Cab." }, { status: 400 });
    if (registration.length < 4 || registration.length > 20 || !/^[A-Z0-9 -]+$/.test(registration)) return NextResponse.json({ error: "Enter a valid vehicle registration number (4–20 letters or numbers)." }, { status: 400 });
    if (make.length < 2 || make.length > 60) return NextResponse.json({ error: "Vehicle make must be 2–60 characters." }, { status: 400 });
    if (model.length < 1 || model.length > 60) return NextResponse.json({ error: "Vehicle model must be 1–60 characters." }, { status: 400 });
    if (color.length > 40) return NextResponse.json({ error: "Vehicle colour must be 40 characters or fewer." }, { status: 400 });
    if (city.length < 2 || city.length > 80) return NextResponse.json({ error: "City must be 2–80 characters." }, { status: 400 });

    await ensureSchema();
    const sql = getSql();
    const current = await sql`select status from public.driver_verifications where user_id = ${user.id} limit 1`;
    if (current[0]?.status === "approved") return NextResponse.json({ error: "Your driver application is approved. Contact support to change vehicle details." }, { status: 409 });
    if (current[0]?.status === "pending") return NextResponse.json({ error: "Your application is under review. Wait for the review result before editing vehicle details." }, { status: 409 });

    const rows = await sql`
      insert into public.driver_application_details (user_id, vehicle_type, registration_number, vehicle_make, vehicle_model, vehicle_color, city, updated_at)
      values (${user.id}, ${vehicleType}, ${registration}, ${make}, ${model}, ${color || null}, ${city}, now())
      on conflict (user_id) do update set vehicle_type = excluded.vehicle_type, registration_number = excluded.registration_number,
        vehicle_make = excluded.vehicle_make, vehicle_model = excluded.vehicle_model, vehicle_color = excluded.vehicle_color,
        city = excluded.city, updated_at = now()
      returning vehicle_type, registration_number, vehicle_make, vehicle_model, vehicle_color, city, updated_at
    `;
    return NextResponse.json({ success: true, application: rows[0], message: "Vehicle details saved securely. This is not a verification submission; upload required documents to request review." });
  } catch (error) {
    return databaseError(error);
  }
}
