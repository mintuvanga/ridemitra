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
