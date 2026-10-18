import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sendCode(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("EMAIL_NOT_CONFIGURED");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your RideMitra verification code",
      text: `Your RideMitra verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("EMAIL_SEND_FAILED");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (name.length < 2 || name.length > 100) return NextResponse.json({ error: "Enter a name between 2 and 100 characters." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error: "Email verification is not configured yet. Add RESEND_API_KEY and EMAIL_FROM to the Render environment." }, { status: 503 });
    await ensureSchema();
    const sql = getSql();
    const existing = await sql`select id, email_verified_at from public.users where email = ${email} limit 1`;
    if (existing[0]?.email_verified_at) return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    const code = String(randomInt(0, 1000000)).padStart(6, "0");
    const codeHash = await hashPassword(code);
    const passwordHash = await hashPassword(password);
    const user = await sql.begin(async (tx) => {
      let rows: any[];
      if (existing[0]) {
        rows = await tx`update public.users set full_name = ${name}, password_hash = ${passwordHash} where id = ${existing[0].id} returning id, email, full_name`;
      } else {
        rows = await tx`insert into public.users (full_name, email, password_hash) values (${name}, ${email}, ${passwordHash}) returning id, email, full_name`;
      }
      await tx`insert into public.profiles (id, full_name) values (${rows[0].id}, ${name}) on conflict (id) do update set full_name = excluded.full_name`;
      await tx`delete from public.email_verification_codes where user_id = ${rows[0].id}`;
      await tx`insert into public.email_verification_codes (user_id, code_hash, expires_at) values (${rows[0].id}, ${codeHash}, now() + interval '10 minutes')`;
      return rows[0];
    });
    try {
      await sendCode(email, code);
    } catch (error) {
      await sql`delete from public.email_verification_codes where user_id = ${user.id}`;
      if (!existing[0]) await sql`delete from public.users where id = ${user.id}`;
      const message = error instanceof Error && error.message === "EMAIL_NOT_CONFIGURED"
        ? "Email verification is not configured yet. Add RESEND_API_KEY and EMAIL_FROM to Render."
        : "We could not send the verification email. Please try again later.";
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ message: "Verification code sent. Check your inbox and spam folder." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("DATABASE_URL") || message.includes("Database is not configured")) return NextResponse.json({ error: "Database is not configured. Add DATABASE_URL to Render." }, { status: 503 });
    if (message.includes("unique") || message.includes("duplicate")) return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    return NextResponse.json({ error: "Unable to create account. Please try again." }, { status: 500 });
  }
}
