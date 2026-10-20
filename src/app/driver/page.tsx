"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected";
type DriverDocument = {
  document_type: "licence" | "rc" | "insurance" | "selfie";
  status: "pending" | "approved" | "rejected";
  original_name: string;
  created_at: string;
};
type VerificationResponse = {
  verification: {
    status: VerificationStatus;
    rejection_reason: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    updated_at: string | null;
  };
  documents: DriverDocument[];
  required_documents: string[];
  submitted_document_count: number;
  can_go_online: boolean;
};

const checklist = [
  { key: "licence", number: "01", title: "Driving licence", detail: "Valid licence, clearly readable" },
  { key: "rc", number: "02", title: "Vehicle RC", detail: "Registration details must match your vehicle" },
  { key: "insurance", number: "03", title: "Vehicle insurance", detail: "Current policy required" },
  { key: "selfie", number: "04", title: "Selfie & identity check", detail: "A selfie is collected; it does not by itself prove identity or liveness" },
] as const;

const statusText: Record<VerificationStatus, string> = {
  not_submitted: "Not submitted",
  pending: "Waiting for review",
  approved: "Approved",
  rejected: "Changes required",
};

export default function DriverHomePage() {
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedOut, setSignedOut] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/driver/verification-status", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        setSignedOut(true);
        setData(null);
        setError("");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Could not load verification status.");
      setData(result as VerificationResponse);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load verification status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
    const timer = window.setInterval(() => void loadStatus(), 20000);
    return () => window.clearInterval(timer);
  }, [loadStatus]);

  const status = data?.verification.status ?? "not_submitted";
  const submitted = new Map((data?.documents ?? []).map((doc) => [doc.document_type, doc]));
  const statusStyle =
    status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
    status === "rejected" ? "border-rose-200 bg-rose-50 text-rose-800" :
    "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900">
      <div className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link href="/" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span><span className="ml-2 text-sm font-semibold text-slate-500">Driver</span></Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/driver/rides" className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-sky-700">My rides →</Link>
            <Link href="/driver/earnings" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50">Earnings ₹</Link>
            <Link href="/support" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50">Help ↗</Link>
          </div>
        </header>

        <section className="rm-page-enter mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-200 sm:p-9">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Driver workspace</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Welcome to RideMitra</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-sky-50 sm:text-base">Check your driver onboarding, verification and ride readiness in one place.</p>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl border border-white/20 bg-white/10 text-5xl md:self-auto" aria-hidden="true">🛵</div>
          </div>
        </section>

        {signedOut ? (
          <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Sign in to view driver status</h2>
            <p className="mt-2 text-sm text-slate-600">Your driver verification details are private and are only available to your signed-in account.</p>
            <Link href="/driver/login" className="mt-5 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-bold text-white hover:bg-sky-700">Go to driver login →</Link>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rm-card-enter rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-sm font-bold text-slate-500">ONBOARDING STATUS</p><h2 className="mt-1 text-2xl font-black">{loading ? "Checking status…" : statusText[status]}</h2></div>
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusStyle}`}>{loading ? "Loading" : statusText[status]}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {status === "approved"
                    ? "Your driver verification is approved. You can open driver mode and go online when location permission is available."
                    : status === "pending"
                      ? "Your submitted documents are waiting for a manual review. You cannot accept rides until approval."
                      : status === "rejected"
                        ? "Your submission needs changes. Review the reason below, correct your documents and resubmit."
                        : "Submit the required documents for review. Driver availability stays locked until an authorised reviewer approves your verification."}
                </p>
                {status === "rejected" && data?.verification.rejection_reason && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900"><strong>Reviewer feedback:</strong> {data.verification.rejection_reason}</div>
                )}
                {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error} <button onClick={() => void loadStatus()} className="ml-2 font-bold underline">Retry</button></div>}
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${status === "approved" ? "w-full bg-emerald-500" : status === "pending" ? "w-3/4 bg-amber-500" : status === "rejected" ? "w-1/2 bg-rose-500" : "w-1/4 bg-sky-500"}`} /></div>
                <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500"><span>Onboarding</span><span>{status === "approved" ? "Ready for driver mode" : "Approval required"}</span></div>
                {status === "approved" ? (
                  <Link href="/driver/instant-rides" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-emerald-700">Open driver mode <span aria-hidden="true">→</span></Link>
                ) : (
                  <Link href="/driver/documents" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700">{status === "pending" ? "View document submission" : status === "rejected" ? "Correct and resubmit documents" : "Continue document check"} <span aria-hidden="true">→</span></Link>
                )}
              </div>

              <div className="rm-card-enter rm-delay-1 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-sm font-bold text-slate-500">RIDE AVAILABILITY</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${data?.can_go_online ? "bg-emerald-100" : "bg-slate-100"}`} aria-hidden="true">{data?.can_go_online ? "🟢" : "🔒"}</span>
                  <div><h2 className="font-extrabold">{data?.can_go_online ? "Verification approved" : "Offline · Locked"}</h2><p className="mt-1 text-sm text-slate-500">{data?.can_go_online ? "Open driver mode to set availability" : "Approval required before going online"}</p></div>
                </div>
                <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-600">Documents received</span><span className="font-black text-sky-800">{data?.submitted_document_count ?? 0} / 4</span></div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Only documents stored and recorded by the server count here. A selfie capture or local file selection alone is not approval.</p>
                </div>
                {data?.can_go_online && <Link href="/driver/instant-rides" className="mt-4 flex w-full items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50">Go to ride requests →</Link>}
              </div>
            </section>

            <section className="rm-card-enter rm-delay-2 mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div><p className="text-sm font-bold text-sky-700">YOUR CHECKLIST</p><h2 className="mt-1 text-2xl font-black">Before your first ride</h2></div>
                <p className="text-sm text-slate-500">{data?.submitted_document_count ?? 0} of 4 documents recorded</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {checklist.map((item) => {
                  const doc = submitted.get(item.key);
                  const label = doc ? (doc.status === "approved" ? "Approved by reviewer" : doc.status === "rejected" ? "Rejected by reviewer" : "Submitted · awaiting review") : "Not submitted";
                  const color = doc?.status === "approved" ? "bg-emerald-50 text-emerald-800" : doc?.status === "rejected" ? "bg-rose-50 text-rose-800" : doc ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600";
                  return <div key={item.key} className="rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50/40">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sm font-black text-sky-700">{item.number}</span>
                      <div className="min-w-0 flex-1"><h3 className="font-extrabold">{item.title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{item.detail}</p><p className={`mt-3 inline-flex rounded-lg px-2.5 py-1.5 text-xs font-bold ${color}`}>{label}</p></div>
                    </div>
                  </div>;
                })}
              </div>
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-extrabold text-sky-950">Need help completing onboarding?</p><p className="mt-1 text-sm text-sky-800">Contact support if you have questions about the required checks.</p></div>
                <Link href="/support" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100">Contact support ↗</Link>
              </div>
            </section>
          </>
        )}
        <footer className="py-7 text-center text-xs leading-5 text-slate-500">RideMitra Driver · Your safety and document privacy come first.</footer>
      </div>
    </main>
  );
}
