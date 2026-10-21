import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  await ensureSchema();
  const db = getSql();
  await db.unsafe("create table if not exists public.support_tickets (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade, subject text not null, category text not null, message text not null, status text not null default 'open', created_at timestamptz not null default now())");
  const tickets = await db`select id, subject, category, message, status, created_at from public.support_tickets where user_id = ${user.id} order by created_at desc limit 50`;
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const allowed = ["account", "rides", "journeys", "verification", "payments", "other"];
  const category = typeof body.category === "string" ? body.category : "other";
  if (subject.length < 4 || subject.length > 120 || message.length < 10 || message.length > 3000 || !allowed.includes(category)) {
    return NextResponse.json({ error: "Check the subject, category and message." }, { status: 400 });
  }
  await ensureSchema();
  const db = getSql();
  await db.unsafe("create table if not exists public.support_tickets (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade, subject text not null, category text not null, message text not null, status text not null default 'open', created_at timestamptz not null default now())");
  const rows = await db`insert into public.support_tickets(user_id, subject, category, message) values (${user.id}, ${subject}, ${category}, ${message}) returning id, subject, category, message, status, created_at`;
  return NextResponse.json({ ticket: rows[0] }, { status: 201 });
}
