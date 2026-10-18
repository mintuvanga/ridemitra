import { NextRequest, NextResponse } from "next/server";
import { hashToken, SESSION_COOKIE } from "@/lib/auth";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      const sql = getSql();
      await sql`delete from public.sessions where token_hash = ${hashToken(token)}`;
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/", expires: new Date(0) });
    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/", expires: new Date(0) });
    return response;
  }
}
