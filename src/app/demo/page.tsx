"use client";

import Link from "next/link";

const checks = [
  { title: "Driving licence", detail: "Sample document · not a real licence", status: "DEMO VERIFIED", icon: "🪪" },
  { title: "Vehicle Registration Certificate", detail: "Sample RC · not an official vehicle record", status: "DEMO VERIFIED", icon: "🚘" },
  { title: "Vehicle insurance", detail: "Sample policy · no real coverage is represented", status: "DEMO VERIFIED", icon: "🛡️" },
  { title: "Selfie & identity check", detail: "Simulated result · no real identity provider used", status: "DEMO VERIFIED", icon: "📸" },
];

export default function DemoDriverPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
          <Link href="/" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span></Link>
          <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-800">DEMO ACCOUNT</span>
        </header>

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-200 sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-100">Testing workspace · Driver</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Welcome, Demo Driver</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">This is a pre-filled demonstration profile so you can preview the driver experience without uploading personal documents or completing real identity checks.</p>
          <div className="mt-5 inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
            <span className="font-bold">Demo email:&nbsp;</span><span>demo@ridemitra.test</span>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 sm:p-6">
          <strong>Demo-only status:</strong> Every check below is marked complete for UI testing only. No real documents were reviewed, no legal identity verification was performed, and this does not authorize anyone to drive or accept real rides.
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-bold text-sky-700">ONBOARDING</p><h2 className="mt-1 text-2xl font-black">Document checklist</h2></div>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-800">4 / 4 demo checks complete</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {checks.map((check) => (
              <article key={check.title} className="rounded-2xl border border-sky-100 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-2xl" aria-hidden="true">{check.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold">{check.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{check.detail}</p>
                    <span className="mt-3 inline-flex rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-800">✓ {check.status}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-5 sm:p-6"><p className="text-sm font-extrabold uppercase tracking-wide text-sky-700">Test both sides</p><h2 className="mt-1 text-2xl font-black">Passenger + Driver demo</h2><p className="mt-2 text-sm leading-6 text-slate-600">Open the passenger demo in one tab, then open the driver request in another tab in this same browser. Request, accept or reject, and watch the passenger status update.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Link href="/demo/passenger" className="rounded-xl bg-sky-600 px-4 py-3 text-center font-extrabold text-white hover:bg-sky-700">Open Passenger Demo →</Link><Link href="/demo/rides/request" className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-center font-extrabold text-sky-700 hover:bg-sky-100">Open Driver Request →</Link></div></section>

        <section className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-sky-700">New · On-demand ride test</p>
          <h2 className="mt-2 text-2xl font-black">Passenger + Driver</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Test a ride request, nearby driver matching, accept/reject, pickup and ride completion. Use two separate accounts and keep both screens open.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/ride" className="rounded-xl bg-sky-600 px-4 py-3 text-center font-extrabold text-white hover:bg-sky-700">Passenger: Request a ride →</Link>
            <Link href="/driver/instant-rides" className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-center font-extrabold text-sky-700 hover:bg-sky-100">Driver: Go online →</Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link href="/demo/rides" className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"><p className="text-sm font-bold text-sky-700">DRIVER</p><h2 className="mt-2 text-lg font-black">My rides ↗</h2><p className="mt-1 text-sm text-slate-500">Open the rides interface.</p></Link>
          <Link href="/demo/earnings" className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"><p className="text-sm font-bold text-sky-700">PAYMENTS</p><h2 className="mt-2 text-lg font-black">Earnings ↗</h2><p className="mt-1 text-sm text-slate-500">Preview earnings and payouts.</p></Link>
          <Link href="/driver" className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"><p className="text-sm font-bold text-sky-700">WORKSPACE</p><h2 className="mt-2 text-lg font-black">Driver dashboard ↗</h2><p className="mt-1 text-sm text-slate-500">View the standard onboarding page.</p></Link>
        </section>

        <footer className="py-7 text-center text-xs leading-5 text-slate-500">RideMitra Demo · Fictional sample data only · No real verification or payouts</footer>
      </div>
    </main>
  );
}
