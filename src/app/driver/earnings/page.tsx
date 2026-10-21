"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ride = {
  id: string;
  pickup: string;
  destination: string;
  vehicle_type: string;
  estimated_fare: number | string | null;
  completed_at: string;
  source: "instant" | "journey";
};

type EarningsData = {
  summary: {
    total_estimated_fare: number;
    this_week_estimated_fare: number;
    completed_rides: number;
    completed_rides_this_week: number;
  };
  rides: Ride[];
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function DriverEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch("/api/driver/earnings", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load completed rides.");
        if (alive) {
          setData(payload);
          setError("");
        }
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not load completed rides.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const cards = [
    { title: "Completed ride fare", value: data ? money(data.summary.total_estimated_fare) : "—", detail: `${data?.summary.completed_rides ?? 0} completed rides`, icon: "₹" },
    { title: "This week", value: data ? money(data.summary.this_week_estimated_fare) : "—", detail: `${data?.summary.completed_rides_this_week ?? 0} rides this week`, icon: "▥" },
    { title: "Payout status", value: "Not enabled", detail: "No payment provider connected", icon: "🔒" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-5 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link href="/driver" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span><span className="ml-2 text-sm font-semibold text-slate-500">Driver</span></Link>
          <Link href="/support" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">Help & support ↗</Link>
        </header>

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-200 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Driver workspace</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Ride summary & payouts</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">Completed rides are read directly from your account. Fare values are estimates only—not confirmed earnings, collected payments, or payouts.</p>
        </section>

        {error && <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error} If you are signed out, please sign in again.</div>}

        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Driver ride summary">
          {cards.map(item => (
            <article key={item.title} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{item.title}</p><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-xl font-black text-sky-700">{item.icon}</span></div>
              <p className="mt-4 text-2xl font-black">{loading ? "Loading…" : item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">Completed ride activity</h2><p className="mt-1 text-sm text-slate-500">Latest 50 completed rides and shared journeys</p></div><span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">Live data</span></div>
            {loading ? <p className="mt-6 text-sm text-slate-500">Loading your ride history…</p> : !data?.rides.length ? (
              <div className="mt-5 rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-5 py-9 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">🛺</div>
                <h3 className="mt-4 font-extrabold">No completed rides yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">When you complete an instant ride or a passenger booking for one of your journeys, it will appear here with its estimated fare.</p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-sky-100">
                {data.rides.map(ride => (
                  <div key={ride.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0"><p className="font-bold">{ride.pickup || "Pickup location"} <span className="text-sky-600">→</span> {ride.destination || "Destination"}</p><p className="mt-1 text-xs text-slate-500">{new Date(ride.completed_at).toLocaleString("en-IN")} · {ride.vehicle_type} · {ride.source === "instant" ? "Instant ride" : "Shared journey"}</p></div>
                      <p className="shrink-0 font-black text-slate-800">{money(Number(ride.estimated_fare || 0))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Important: these are estimated ride fares stored by the app. Driver commission, expenses, payment collection, and payouts are not calculated or verified.</p>
          </article>

          <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-black">Payout setup</h2>
            <p className="mt-1 text-sm text-slate-500">Payment destination and transfer status</p>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <span className="text-xl" aria-hidden="true">🔒</span>
              <div><p className="font-extrabold text-amber-900">Payouts are not enabled</p><p className="mt-1 text-sm leading-5 text-amber-800">A secure payment provider and verified payout configuration are required before transfers can be made. No money is transferred by this page.</p></div>
            </div>
            <Link href="/support" className="mt-4 flex w-full items-center justify-center rounded-xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50">Ask support about payouts ↗</Link>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Keep your driver account ready</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Driver verification must be approved before rides can be accepted. Keep your driver profile and documents up to date.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href="/driver/documents" className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-sky-700">Open verification →</Link>
            <Link href="/driver/rides" className="inline-flex items-center justify-center rounded-xl border border-sky-200 px-5 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50">View my rides</Link>
          </div>
        </section>

        <nav className="mt-6 grid grid-cols-3 gap-3" aria-label="Driver navigation">
          <Link href="/driver" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">⌂</span><span className="mt-1 block">Dashboard</span></Link>
          <Link href="/driver/rides" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">🛺</span><span className="mt-1 block">My rides</span></Link>
          <Link href="/driver/earnings" aria-current="page" className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-center text-sm font-bold text-sky-700"><span className="block text-xl">₹</span><span className="mt-1 block">Ride summary</span></Link>
        </nav>
        <footer className="py-7 text-center text-xs text-slate-500">RideMitra Driver · Fare summaries are estimates; payouts are not enabled.</footer>
      </div>
    </main>
  );
}
