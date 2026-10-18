import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Intentionally fail closed until private object storage and a genuine
// identity-verification provider are configured and integrated.
export async function POST() {
  return NextResponse.json(
    {
      error: "Secure document submission is not enabled yet. No files were uploaded or saved. Please contact support; your account has not been approved.",
      status: "not_configured",
    },
    { status: 503 },
  );
}
