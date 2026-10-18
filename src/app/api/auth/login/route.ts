import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    const sql = getSql();
    const rows = await sql`select id, email, full_name, password_hash, email_verified_at from public.users where email = ${email} limit 1`;
    if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    if (!rows[0].email_verified_at) return NextResponse.json({ error: "Please verify your email before signing in." }, { status: 403 });
    await createSession(rows[0].id, new URL(request.url).protocol === "https:");
    return NextResponse.json({ user: { id: rows[0].id, email: rows[0].email, full_name: rows[0].full_name } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("DATABASE_URL") || message.includes("Database is not configured")) return NextResponse.json({ error: "Database is not configured. Add DATABASE_URL to Render." }, { status: 503 });
    return NextResponse.json({ error: "Unable to sign in. Please try again." }, { status: 500 });
  }
}
