"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Ride = {
  id: string;
  pickup: string;
  destination: string;
  vehicle_type: string;
  estimated_fare: number;
  status: string;
  passenger_name: string;
  pickup_distance_km?: number;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number.isFinite(value) ? value : 0);

export default function NewRideRequestsPage() {
  const [requests, setRequests] = useState<Ride[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [presenceResponse, ridesResponse] = await Promise.all([
        fetch("/api/driver/presence", { cache: "no-store" }),
        fetch("/api/driver/instant-rides", { cache: "no-store" }),
      ]);
      const presenceData = await presenceResponse.json();
      const ridesData = await ridesResponse.json();
      if (presenceResponse.ok) setOnline(Boolean(presenceData.presence?.is_online));
      if (!ridesResponse.ok) throw new Error(ridesData.error || "Unable to load new ride requests.");
      setRequests(Array.isArray(ridesData.requests) ? ridesData.requests : []);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load new ride requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function act(ride: Ride, action: "accept" | "reject") {
    setBusy(ride.id);
    setError("");
    try {
      const response = await fetch("/api/driver/instant-rides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: ride.id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update this ride.");
      await load();
      if (action === "accept") {
        window.location.href = "https://www.google.com/maps/dir/?api=1&destination=" +
          encodeURIComponent(ride.pickup) + "&travelmode=driving";
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update this ride.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="min-h-screen bg-[#071827] px-3 py-4 text-[#edf7f7] sm:px-4">
      <div className="mx-auto w-full max-w-[520px]">
        <header className="flex items-center justify-between gap-3">
          <Link href="/driver/instant-rides" className="text-lg font-black">Ride<span className="text-emerald-300">Mitra</span></Link>
          <Link href="/driver/instant-rides" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-200">← Dashboard</Link>
        </header>
        <section className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d2b40] to-[#0b3b3a] p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-200">Driver requests</p>
          <h1 className="mt-2 text-2xl font-black">New ride requests</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Keep this page open while online. New matching requests refresh automatically.</p>
          <p className={"mt-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold " + (online ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" : "border-white/10 bg-white/5 text-slate-300")}>
            {online ? "● You are online" : "○ You are offline"}
          </p>
        </section>
        {error && <p role="alert" className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
        {!online && <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b2234] p-5 text-center">
          <h2 className="font-extrabold">You’re currently offline</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Go online from the dashboard to receive nearby ride requests.</p>
          <Link href="/driver/instant-rides" className="mt-4 inline-flex rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-[#062033]">Go to dashboard</Link>
        </div>}
        {loading ? <p className="mt-5 rounded-2xl bg-[#0b2234] p-5 text-sm text-slate-300">Checking for ride requests…</p> : requests.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b2234] p-6 text-center">
            <span className="text-3xl text-emerald-200">⌁</span>
            <h2 className="mt-3 font-extrabold">Waiting for your next ride</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This page checks for matching requests automatically every 5 seconds.</p>
          </div>
        ) : <div className="mt-4 space-y-3">{requests.map((ride) => (
          <article key={ride.id} className="rounded-2xl border border-white/10 bg-[#0b2234] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-200">{Number(ride.pickup_distance_km || 0).toFixed(1)} km away · {ride.vehicle_type}</p><h2 className="mt-1 font-black">{ride.passenger_name || "Ride customer"}</h2></div>
              <p className="shrink-0 text-lg font-black text-emerald-200">{money(Number(ride.estimated_fare || 0))}</p>
            </div>
            <div className="mt-4 space-y-2 text-sm leading-5 text-slate-300"><p><span className="text-emerald-300">●</span> <b className="text-white">Pickup:</b> {ride.pickup}</p><p><span className="text-rose-300">●</span> <b className="text-white">Drop:</b> {ride.destination}</p></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" disabled={busy === ride.id} onClick={() => void act(ride, "reject")} className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-bold text-slate-200 disabled:opacity-50">{busy === ride.id ? "Please wait…" : "Decline"}</button>
              <button type="button" disabled={busy === ride.id} onClick={() => void act(ride, "accept")} className="min-h-11 rounded-xl bg-emerald-300 px-3 text-sm font-black text-[#062033] disabled:opacity-50">{busy === ride.id ? "Please wait…" : "Accept ride"}</button>
            </div>
          </article>
        ))}</div>}
      </div>
    </main>
  );
}
