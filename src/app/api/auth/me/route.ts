import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const user = await getCurrentUser();
    return NextResponse.json({ user: user ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check session.";
    const status = message.includes("DATABASE_URL") || message.includes("Database is not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "Database is not configured." : "Unable to check session." }, { status });
  }
}
