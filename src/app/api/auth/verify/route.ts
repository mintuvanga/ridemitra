import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter your email and the six-digit code." }, { status: 400 });
    const sql = getSql();
    const rows = await sql`select u.id, u.email, u.full_name, c.id as code_id, c.code_hash, c.attempts
      from public.users u join public.email_verification_codes c on c.user_id = u.id
      where u.email = ${email} and u.email_verified_at is null and c.expires_at > now()
      order by c.created_at desc limit 1`;
    if (!rows[0]) return NextResponse.json({ error: "The code is invalid or expired. Please sign up again." }, { status: 400 });
    if (Number(rows[0].attempts) >= 5) return NextResponse.json({ error: "Too many attempts. Please request a new code." }, { status: 429 });
    const valid = await verifyPassword(code, rows[0].code_hash);
    if (!valid) {
      await sql`update public.email_verification_codes set attempts = attempts + 1 where id = ${rows[0].code_id}`;
      return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
    }
    await sql.begin(async (tx) => {
      await tx`update public.users set email_verified_at = now() where id = ${rows[0].id}`;
      await tx`delete from public.email_verification_codes where user_id = ${rows[0].id}`;
    });
    await createSession(rows[0].id, new URL(request.url).protocol === "https:");
    return NextResponse.json({ user: { id: rows[0].id, email: rows[0].email, full_name: rows[0].full_name } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("DATABASE_URL") || message.includes("Database is not configured")) return NextResponse.json({ error: "Database is not configured. Add DATABASE_URL to Render." }, { status: 503 });
    return NextResponse.json({ error: "Unable to verify your email. Please try again." }, { status: 500 });
  }
}
