"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const requiredDocs = [
  { key: "licence", title: "Driving licence", detail: "Front and back, clearly readable", accept: "image/*,.pdf" },
  { key: "rc", title: "Vehicle Registration Certificate (RC)", detail: "For the vehicle you will use", accept: "image/*,.pdf" },
  { key: "insurance", title: "Vehicle insurance", detail: "Current policy showing vehicle details", accept: "image/*,.pdf" },
  { key: "selfie", title: "Live selfie / face match", detail: "A recent, clear selfie of the driver", accept: "image/*" },
] as const;

export default function DriverDocumentsPage() {
  const router = useRouter();
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.user) {
          router.replace("/");
          return;
        }
        if (active) setSessionChecked(true);
      })
      .catch(() => router.replace("/"))
      .finally(() => { if (active) setSessionChecked(true); });
    return () => { active = false; };
  }, [router]);

  const selectedCount = requiredDocs.filter(doc => files[doc.key]).length;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (selectedCount !== requiredDocs.length) {
      setMessage("Please select all four required documents before continuing.");
      return;
    }
    // Do not claim that files have been uploaded or verified. Secure storage and a genuine identity-verification provider must be configured first.
    setBusy(true);
    try {
      const response = await fetch("/api/driver/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: requiredDocs.map(doc => ({
            type: doc.key,
            fileName: files[doc.key]?.name ?? "",
            fileSize: files[doc.key]?.size ?? 0,
            mimeType: files[doc.key]?.type ?? "",
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Secure document submission is not ready yet.");
      setMessage(result.message || "Your documents were received for review.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit documents.");
    } finally {
      setBusy(false);
    }
  }

  if (!sessionChecked) return <main className="flex min-h-screen items-center justify-center bg-sky-50 text-sky-900">Checking your driver account…</main>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
          <Link href="/" className="text-lg font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span> <span className="text-sm font-medium text-slate-500">Driver</span></Link>
          <Link href="/support" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">Contact Support ↗</Link>
        </header>
        <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/60 sm:p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">🛡️</div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Step 1 of driver approval</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Verify your documents</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Upload clear, genuine documents that belong to you and your vehicle. Your driver account stays unapproved until the checks are completed.</p>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Important:</strong> Selecting files here does not upload or verify them. Secure file storage and a real identity-verification provider must be connected before submissions can be accepted. We will not mark documents as verified without those checks.</div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {requiredDocs.map((doc, index) => (
              <label key={doc.key} className="block rounded-2xl border border-slate-200 p-4 transition hover:border-sky-300">
                <span className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-bold text-sky-700">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{doc.title} <span className="text-red-500">*</span></span>
                    <span className="mt-1 block text-sm text-slate-500">{doc.detail}</span>
                    <input required type="file" accept={doc.accept} capture={doc.key === "selfie" ? "user" : undefined} onChange={event => setFiles(current => ({ ...current, [doc.key]: event.target.files?.[0] ?? null }))} className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:font-semibold file:text-sky-800" />
                    {files[doc.key] && <span className="mt-2 block break-all text-xs text-sky-700">Selected: {files[doc.key]?.name}</span>}
                  </span>
                </span>
              </label>
            ))}
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{selectedCount} of 4 required files selected</div>
            <button disabled={busy} type="submit" className="w-full rounded-xl bg-sky-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:opacity-60">{busy ? "Checking setup…" : "Submit documents for verification"}</button>
            {message && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{message}</p>}
          </form>
          <p className="mt-5 text-xs leading-5 text-slate-500">Your identity documents are sensitive personal information. We will only accept them once secure storage, restricted access, retention rules, and verification checks are in place.</p>
        </section>
      </div>
    </main>
  );
}
