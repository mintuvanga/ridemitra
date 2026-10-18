"use client";

import Link from "next/link";
import { useState } from "react";

export default function DriverRidesPage() {
  const [tab, setTab] = useState<"available" | "upcoming" | "completed">("available");

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-5 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link href="/driver" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span><span className="ml-2 text-sm font-semibold text-slate-500">Driver</span></Link>
          <Link href="/support" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">Contact Support ↗</Link>
        </header>

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-200 sm:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Driver workspace</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your rides</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-sky-50 sm:text-base">View ride requests and manage your upcoming trips from one place.</p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-3xl border border-white/20 bg-white/10 text-4xl sm:self-auto" aria-hidden="true">🛺</div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">Available requests</p><p className="mt-2 text-3xl font-black">—</p><p className="mt-1 text-xs text-slate-500">Live ride feed not connected</p></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">Upcoming trips</p><p className="mt-2 text-3xl font-black">—</p><p className="mt-1 text-xs text-slate-500">No trip data loaded</p></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">Completed trips</p><p className="mt-2 text-3xl font-black">—</p><p className="mt-1 text-xs text-slate-500">Trip history not connected</p></div>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-2xl font-black">Ride activity</h2><p className="mt-1 text-sm text-slate-500">Your trip lists will appear here once the ride service is connected.</p></div>
            <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-xs font-bold sm:text-sm">
              {([["available", "Available"], ["upcoming", "Upcoming"], ["completed", "Completed"]] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-lg px-3 py-2 transition ${tab === key ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{label}</button>)}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-5 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">{tab === "available" ? "🧭" : tab === "upcoming" ? "🗓️" : "🧾"}</div>
            <h3 className="mt-4 text-lg font-extrabold">{tab === "available" ? "No live ride requests yet" : tab === "upcoming" ? "No upcoming trips" : "No completed trips to show"}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{tab === "available" ? "Ride requests will show here after the live dispatch service is connected and your driver profile is approved." : tab === "upcoming" ? "Trips you accept will appear here when booking and dispatch are connected." : "Completed ride history will appear here when trip tracking is connected."}</p>
            <div className="mx-auto mt-5 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm leading-5 text-amber-900"><strong>Account status: Verification required.</strong> You cannot go online or accept rides until your documents and identity are genuinely verified.</div>
            <Link href="/driver/documents" className="mt-5 inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700">Continue verification <span className="ml-2" aria-hidden="true">→</span></Link>
          </div>
        </section>

        <nav className="mt-6 grid grid-cols-3 gap-3" aria-label="Driver navigation">
          <Link href="/driver" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">⌂</span><span className="mt-1 block">Dashboard</span></Link>
          <Link href="/driver/rides" aria-current="page" className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-center text-sm font-bold text-sky-700"><span className="block text-xl">🛺</span><span className="mt-1 block">My rides</span></Link>
          <Link href="/support" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">♡</span><span className="mt-1 block">Support</span></Link>
        </nav>
        <footer className="py-7 text-center text-xs text-slate-500">RideMitra Driver · Ride data will be shown only when supplied by the live service.</footer>
      </div>
    </main>
  );
}
