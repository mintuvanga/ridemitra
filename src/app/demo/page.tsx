"use client";

import Link from "next/link";
import { useState } from "react";
import DemoMenu from "@/components/demo/DemoMenu";

const cash = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function DemoDriverPage() {
  const [online, setOnline] = useState(false);
  const [vehicle, setVehicle] = useState("Bike");

  const shortcuts = [
    ["Incoming requests", "/demo/rides/request", "Review pickup, destination and sample fare"],
    ["Active ride", "/demo/active-ride", "Preview arrival, trip start and completion"],
    ["Ride history", "/demo/history", "Review sample completed trips"],
    ["Earnings", "/demo/earnings", "See illustrative totals"],
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><DemoMenu /><Link href="/demo" className="text-2xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span></Link></div>
          <div className="flex items-center gap-2"><span className="hidden rounded-full bg-violet-50 px-3 py-1.5 text-xs font-extrabold text-violet-800 sm:inline-flex">GUEST DEMO</span><Link href="/driver/login" className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700">Driver sign in</Link></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Demo only:</strong> All rides and fares are fictional. This preview does not dispatch real requests, collect GPS, upload documents or process payments.</div>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Captain workspace · Hyderabad</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Good day, Demo Driver</h1>
            <p className="mt-2 max-w-xl text-slate-600">Choose when you are available. When online in the real service, eligible drivers can receive nearby ride requests.</p>
            <div className={"mt-6 flex items-center gap-3 rounded-2xl p-4 " + (online ? "bg-emerald-50" : "bg-slate-100")}>
              <span className={"h-3 w-3 rounded-full " + (online ? "bg-emerald-500" : "bg-slate-400")} />
              <div className="flex-1"><p className="font-extrabold">{online ? "You're online · Demo" : "You're offline"}</p><p className="mt-0.5 text-sm text-slate-600">{online ? "Sample availability is enabled on this page." : "Go online when you are ready to receive rides."}</p></div>
            </div>
            <label className="mt-5 block text-sm font-bold text-slate-700">Vehicle type
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:max-w-xs"><option>Bike</option><option>Auto</option><option>Cab</option></select>
            </label>
            <button type="button" onClick={() => setOnline(v => !v)} className={"mt-4 w-full rounded-2xl px-5 py-4 text-base font-black text-white shadow-sm transition sm:max-w-xs " + (online ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700")}>{online ? "Go Offline" : "Go Online"} <span className="ml-1 text-xs font-bold opacity-90">· Demo</span></button>
            <p className="mt-3 text-xs text-slate-500">This toggle is a visual simulation only. It does not change real dispatch availability or use your location.</p>
          </article>

          <article className="rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 p-6 text-white shadow-sm sm:p-8">
            <p className="text-sm font-bold text-sky-100">Today's overview</p>
            <h2 className="mt-2 text-2xl font-black">Your activity at a glance</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[["Requests", "2"], ["Completed", "0"], ["Today's earnings", cash(0)], ["Vehicle", vehicle]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-xs font-semibold text-sky-100">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}
            </div>
            <Link href="/demo/earnings" className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-sky-800 hover:bg-sky-50">View earnings →</Link>
          </article>
        </section>

        <section className="mt-7">
          <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-sky-700">Quick access</p><h2 className="mt-1 text-2xl font-black">Your driver tools</h2></div><button type="button" onClick={() => setOnline(false)} className="text-sm font-bold text-slate-500 underline">Set offline</button></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map(([title, href, description]) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"><div className="flex items-center justify-between"><h3 className="font-extrabold">{title}</h3><span className="text-xl text-sky-700 transition group-hover:translate-x-1">→</span></div><p className="mt-2 text-sm leading-5 text-slate-500">{description}</p></Link>)}
          </div>
        </section>
        <footer className="py-8 text-center text-xs text-slate-500">RideMitra guest preview · Sample information only · <Link href="/driver/login" className="font-bold text-sky-700 underline">Sign in to your private account</Link></footer>
      </div>
    </main>
  );
}
