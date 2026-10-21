import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { ensureSchema, getSql } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function setup() {
 const db=getSql();
 await db.unsafe("create table if not exists public.support_tickets (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade, subject text not null, category text not null, message text not null, status text not null default 'open', created_at timestamptz not null default now())");
}
export async function GET() {
 try {
  await requireAdmin(); await ensureSchema(); await setup();
  const db=getSql();
  const tickets=await db`select t.id,t.subject,t.category,t.message,t.status,t.created_at,u.full_name,u.email from public.support_tickets t join public.users u on u.id=t.user_id order by t.created_at desc limit 200`;
  return NextResponse.json({tickets});
 } catch(e) {
  const m=e instanceof Error?e.message:"";
  const status=m==="AUTH_REQUIRED"?401:m==="ADMIN_FORBIDDEN"?403:m==="ADMIN_NOT_CONFIGURED"?503:500;
  return NextResponse.json({error:status===401?"Sign in required":status===403?"Admin access required":status===503?"Admin email is not configured":"Unable to load support queue"},{status});
 }
}
export async function PATCH(request:Request) {
 try {
  await requireAdmin();
  const body=await request.json().catch(()=>null);
  const id=typeof body?.id==="string"?body.id:"";
  const status=typeof body?.status==="string"?body.status:"";
  if(!id||!["open","in_progress","resolved","closed"].includes(status))return NextResponse.json({error:"Invalid ticket or status"},{status:400});
  await ensureSchema(); await setup();
  const db=getSql();
  const rows=await db`update public.support_tickets set status=${status} where id=${id} returning id,status`;
  if(!rows.length)return NextResponse.json({error:"Ticket not found"},{status:404});
  return NextResponse.json({success:true,ticket:rows[0]});
 } catch(e) {
  const m=e instanceof Error?e.message:"";
  const status=m==="AUTH_REQUIRED"?401:m==="ADMIN_FORBIDDEN"?403:m==="ADMIN_NOT_CONFIGURED"?503:500;
  return NextResponse.json({error:status===401?"Sign in required":status===403?"Admin access required":status===503?"Admin email is not configured":"Unable to update ticket"},{status});
 }
}
