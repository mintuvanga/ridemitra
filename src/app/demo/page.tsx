"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DemoMenu from "@/components/demo/DemoMenu";

const cash = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function DemoDriverPage() {
  const [online, setOnline] = useState(false);
  const [vehicle, setVehicle] = useState("Not selected");
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ridemitra_demo_onboarding");
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.vehicle === "string" && data.vehicle) setVehicle(data.vehicle);
      }
    } catch {}
  }, []);

  const shortcuts = [
    ["Incoming requests", "/demo/rides/request", "Review pickup, destination and sample fare"],
    ["Active ride", "/demo/active-ride", "Preview arrival, trip start and completion"],
    ["Ride history", "/demo/history", "Review sample completed trips"],
    ["Earnings", "/demo/earnings", "See illustrative totals"],
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-900 sm:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
          <div className="flex items-center gap-3"><DemoMenu /><Link href="/demo" className="text-xl font-black tracking-tight sm:text-2xl">Ride<span className="text-sky-600">Mitra</span></Link></div>
          <div className="flex items-center gap-2"><span className="hidden rounded-full bg-violet-50 px-3 py-1.5 text-xs font-extrabold text-violet-800 sm:inline-flex">GUEST DEMO</span><Link href="/driver/login" className="rounded-xl bg-sky-600 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-sky-700 sm:px-4 sm:text-sm">Driver sign in</Link></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Demo only:</strong> All rides and fares are fictional. This preview does not dispatch real requests, collect GPS, upload documents or process payments.</div>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Captain workspace · Hyderabad</p>
            <h1 className="mt-2 text-2xl font-black sm:text-4xl">Good day, Demo Driver</h1>
            <p className="mt-2 max-w-xl text-slate-600">Choose when you are available. When online in the real service, eligible drivers can receive nearby ride requests.</p>
            <div className={"mt-6 flex items-center gap-3 rounded-2xl p-4 " + (online ? "bg-emerald-50" : "bg-slate-100")}>
              <span className={"h-3 w-3 rounded-full " + (online ? "bg-emerald-500" : "bg-slate-400")} />
              <div className="flex-1"><p className="font-extrabold">{online ? "You're online · Demo" : "You're offline"}</p><p className="mt-0.5 text-sm text-slate-600">{online ? "Sample availability is enabled on this page." : "Go online when you are ready to receive rides."}</p></div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:max-w-md">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Registered vehicle</p>
              <p className="mt-1 text-lg font-black">{vehicle === "Not selected" ? "Choose during onboarding" : vehicle}</p>
              <p className="mt-1 text-sm text-slate-600">{vehicle === "Not selected" ? "Select your vehicle type before submitting your driver application." : "Vehicle choice comes from the demo onboarding flow."}</p>
              <Link href="/demo/onboarding" className="mt-3 inline-flex rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-extrabold text-sky-800 hover:bg-sky-50">{vehicle === "Not selected" ? "Start driver onboarding →" : "View onboarding details →"}</Link>
            </div>
            <button type="button" onClick={() => setOnline(v => !v)} className={"mt-4 w-full rounded-2xl px-5 py-4 text-base font-black text-white shadow-sm transition sm:max-w-xs " + (online ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700")}>{online ? "Go Offline" : "Go Online"} <span className="ml-1 text-xs font-bold opacity-90">· Demo</span></button>
            <p className="mt-3 text-xs text-slate-500">This toggle is a visual simulation only. It does not change real dispatch availability or use your location.</p>
          </article>

          <article className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Today's summary</p><p className="mt-1 text-sm font-bold text-slate-700">Tap to expand details</p></div>
              <button type="button" aria-expanded={showStats} onClick={() => setShowStats(v => !v)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl font-black text-sky-700 hover:bg-sky-50">{showStats ? "−" : "+"}</button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
              <button type="button" onClick={() => setShowStats(v => !v)} className="min-w-0 rounded-xl bg-sky-50 p-2.5 text-left hover:bg-sky-100 sm:p-3"><span className="text-xl" aria-hidden="true">₹</span><p className="mt-1 text-[11px] font-bold text-slate-500">Earnings</p><p className="text-base font-black text-slate-900">{cash(0)}</p></button>
              <button type="button" onClick={() => setShowStats(v => !v)} className="min-w-0 rounded-xl bg-emerald-50 p-2.5 text-left hover:bg-emerald-100 sm:p-3"><span className="text-xl" aria-hidden="true">✓</span><p className="mt-1 text-[11px] font-bold text-slate-500">Completed</p><p className="text-base font-black text-slate-900">0 rides</p></button>
              <button type="button" onClick={() => setShowStats(v => !v)} className="min-w-0 rounded-xl bg-rose-50 p-2.5 text-left hover:bg-rose-100 sm:p-3"><span className="text-xl" aria-hidden="true">↙</span><p className="mt-1 text-[11px] font-bold text-slate-500">Rejected</p><p className="text-base font-black text-slate-900">0 rides</p></button>
            </div>
            {showStats && <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between py-1"><span className="text-slate-500">Registered vehicle</span><strong>{vehicle}</strong></div><div className="flex justify-between py-1"><span className="text-slate-500">Incoming sample requests</span><strong>2</strong></div><Link href="/demo/earnings" className="mt-3 inline-flex font-extrabold text-sky-700 underline">View earnings details →</Link></div>}
            <p className="mt-3 text-[11px] text-slate-400">Guest demo · sample totals only</p>
          </article>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-sky-700">Quick access</p><h2 className="mt-1 text-2xl font-black">Your driver tools</h2></div><button type="button" onClick={() => setOnline(false)} className="text-sm font-bold text-slate-500 underline">Set offline</button></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map(([title, href, description]) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"><div className="flex items-center justify-between"><h3 className="font-extrabold">{title}</h3><span className="text-xl text-sky-700 transition group-hover:translate-x-1">→</span></div><p className="mt-2 text-sm leading-5 text-slate-500">{description}</p></Link>)}
          </div>
        </section>
        <footer className="py-8 text-center text-xs text-slate-500">RideMitra guest preview · Sample information only · <Link href="/driver/login" className="font-bold text-sky-700 underline">Sign in to your private account</Link></footer>
      </div><nav aria-label="Demo driver navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"><Link href="/demo" className="flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-bold text-sky-700"><span className="text-xl" aria-hidden="true">⌂</span>Home</Link><Link href="/demo/rides/request" className="flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-bold text-slate-600"><span className="text-xl" aria-hidden="true">↗</span>Requests</Link><Link href="/demo/active-ride" className="flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-bold text-slate-600"><span className="text-xl" aria-hidden="true">✓</span>Active</Link><Link href="/demo/earnings" className="flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-bold text-slate-600"><span className="text-xl" aria-hidden="true">₹</span>Earnings</Link></nav>
    </main>
  );
}
