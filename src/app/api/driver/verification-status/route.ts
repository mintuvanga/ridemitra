import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to check driver verification." }, { status: 401 });
    }

    await ensureSchema();
    const sql = getSql();
    const verificationRows = await sql`
      select status, rejection_reason, submitted_at, reviewed_at, updated_at
      from public.driver_verifications
      where user_id = ${user.id}
      limit 1
    `;
    const documentRows = await sql`
      select document_type, status, original_name, created_at
      from public.driver_documents
      where user_id = ${user.id}
      order by document_type
    `;

    const verification = verificationRows[0];
    return NextResponse.json({
      verification: {
        status: verification?.status ?? "not_submitted",
        rejection_reason: verification?.rejection_reason ?? null,
        submitted_at: verification?.submitted_at ?? null,
        reviewed_at: verification?.reviewed_at ?? null,
        updated_at: verification?.updated_at ?? null,
      },
      documents: documentRows,
      required_documents: ["licence", "rc", "insurance", "selfie"],
      submitted_document_count: documentRows.length,
      can_go_online: verification?.status === "approved",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status =
      message.includes("DATABASE_URL") || message.includes("Database is not configured")
        ? 503
        : 500;
    return NextResponse.json(
      { error: status === 503 ? "Database is not configured." : "Unable to load driver verification status." },
      { status },
    );
  }
}
