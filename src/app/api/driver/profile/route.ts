import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to manage your profile." }, { status: 401 });
    await ensureSchema();
    const sql = getSql();
    await sql`insert into public.profiles (id, full_name)
      values (${user.id}, ${user.full_name})
      on conflict (id) do update set full_name = excluded.full_name`;
    const rows = await sql`select u.id, u.email, u.full_name, p.home_city, p.avatar_url
      from public.users u left join public.profiles p on p.id = u.id
      where u.id = ${user.id} limit 1`;
    return NextResponse.json({ profile: rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to load your profile." }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Sign in to update your profile." }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Enter valid profile details." }, { status: 400 });
    const fullName = typeof body.full_name === "string" ? body.full_name.trim().replace(/\s+/g, " ") : "";
    const homeCity = typeof body.home_city === "string" ? body.home_city.trim().replace(/\s+/g, " ") : "";
    if (fullName.length < 2 || fullName.length > 80) return NextResponse.json({ error: "Name must be between 2 and 80 characters." }, { status: 400 });
    if (homeCity.length > 80) return NextResponse.json({ error: "Home city must be 80 characters or fewer." }, { status: 400 });
    await ensureSchema();
    const sql = getSql();
    await sql.begin(async (tx) => {
      await tx`update public.users set full_name = ${fullName} where id = ${user.id}`;
      await tx`insert into public.profiles (id, full_name, home_city)
        values (${user.id}, ${fullName}, ${homeCity || null})
        on conflict (id) do update set full_name = excluded.full_name, home_city = excluded.home_city`;
    });
    return NextResponse.json({ success: true, profile: { id: user.id, email: user.email, full_name: fullName, home_city: homeCity || null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to save your profile." }, { status });
  }
}
