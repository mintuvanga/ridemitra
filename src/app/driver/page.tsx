"use client";

import Link from "next/link";

const checklist = [
  { number: "01", title: "Driving licence", detail: "Front and back images", status: "Awaiting secure submission" },
  { number: "02", title: "Vehicle RC", detail: "Registration details must match your vehicle", status: "Awaiting secure submission" },
  { number: "03", title: "Vehicle insurance", detail: "Current policy required", status: "Awaiting secure submission" },
  { number: "04", title: "Live selfie & identity match", detail: "A real liveness and face-match check is required", status: "Provider not connected" },
];

export default function DriverHomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900">
      <div className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link href="/" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span><span className="ml-2 text-sm font-semibold text-slate-500">Driver</span></Link>
          <div className="flex items-center gap-2"><Link href="/driver/rides" className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700">My rides →</Link><Link href="/support" className="rounded-xl border border-sky-200 px-4 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-50">Help & support ↗</Link></div>
        </header>

        <section className="rm-page-enter mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-200 sm:p-9">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Driver workspace</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Welcome to RideMitra</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-sky-50 sm:text-base">Complete onboarding to prepare your driver profile. Your account cannot accept rides until your documents and identity are genuinely verified.</p>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl border border-white/20 bg-white/10 text-5xl md:self-auto" aria-hidden="true">🛵</div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rm-card-enter rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-bold text-slate-500">ONBOARDING STATUS</p><h2 className="mt-1 text-2xl font-black">Verification pending</h2></div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">Not approved</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">The current app does not yet have secure document storage or a real face-match/liveness provider connected. For your protection, no document is marked verified and driver availability stays locked.</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-1/4 rounded-full bg-sky-500" /></div>
            <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500"><span>Onboarding started</span><span>Verification required</span></div>
            <Link href="/driver/documents" className="rm-tap mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700">Continue document check <span aria-hidden="true">→</span></Link>
          </div>

          <div className="rm-card-enter rm-delay-1 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-sm font-bold text-slate-500">RIDE AVAILABILITY</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl" aria-hidden="true">🔒</span>
              <div><h2 className="font-extrabold">Offline · Locked</h2><p className="mt-1 text-sm text-slate-500">Verification required first</p></div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-600">Go online</span><button type="button" disabled aria-disabled="true" title="Available after genuine driver verification" className="relative h-7 w-12 cursor-not-allowed rounded-full bg-slate-300 opacity-70"><span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow" /></button></div>
              <p className="mt-2 text-xs leading-5 text-slate-500">This control is intentionally disabled until real verification is implemented and completed.</p>
            </div>
          </div>
        </section>

        <section className="rm-card-enter rm-delay-2 mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold text-sky-700">YOUR CHECKLIST</p><h2 className="mt-1 text-2xl font-black">Before your first ride</h2></div>
            <p className="text-sm text-slate-500">4 required checks</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <div key={item.number} className="rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50/40">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sm font-black text-sky-700">{item.number}</span>
                  <div className="min-w-0 flex-1"><h3 className="font-extrabold">{item.title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{item.detail}</p><p className="mt-3 inline-flex rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800">{item.status}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-extrabold text-sky-950">Need help completing onboarding?</p><p className="mt-1 text-sm text-sky-800">Contact support if you have questions about the required checks.</p></div>
            <Link href="/support" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100">Contact support ↗</Link>
          </div>
        </section>

        <footer className="py-7 text-center text-xs leading-5 text-slate-500">RideMitra Driver · Your safety and document privacy come first.</footer>
      </div>
    </main>
  );
}
