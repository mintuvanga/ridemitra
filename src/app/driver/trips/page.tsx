"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Trip = {
  id: string;
  origin_city: string;
  destination_city: string;
  departure_at: string;
  vehicle_type: string;
  seats_total: number;
  seats_available: number;
  price_per_seat: number | string;
  notes: string | null;
  status: "open" | "full" | "cancelled" | "completed";
  pending_requests: number;
  confirmed_bookings: number;
};

const money = (value: number | string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
const date = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function DriverTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/driver/trips", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load your journeys.");
      setTrips(Array.isArray(result.trips) ? result.trips : []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your journeys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function cancelTrip(trip: Trip) {
    if (!window.confirm("Cancel this journey? Pending requests will be closed. Journeys with confirmed passengers cannot be cancelled here.")) return;
    setBusy(trip.id);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/driver/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trip.id, action: "cancel" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not cancel this journey.");
      setNotice(result.message || "Journey cancelled.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel this journey.");
    } finally {
      setBusy("");
    }
  }

  return <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
        <Link href="/driver" className="text-2xl font-black">Ride<span className="text-sky-600">Mitra</span><span className="ml-2 text-sm font-semibold text-slate-500">Driver</span></Link>
        <div className="flex flex-wrap gap-2"><Link href="/driver/notifications" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">Ride activity</Link><Link href="/driver/rides" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700">Seat requests</Link><Link href="/trips/new" className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700">+ Publish journey</Link></div>
      </header>
      <section className="mt-6 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-100">Driver workspace</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">My shared journeys</h1><p className="mt-3 text-sm leading-6 text-sky-50">Review the journeys you published, track seat requests, and close a journey when it has no confirmed passengers.</p></section>
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error} {error.toLowerCase().includes("sign in") && <Link className="font-bold underline" href="/driver/login">Sign in</Link>} <button className="ml-2 font-bold underline" onClick={() => { setLoading(true); void load(); }}>Retry</button></p>}
      {loading ? <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-8 text-center text-slate-500">Loading your journeys…</div> : trips.length === 0 ? <section className="mt-6 rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm"><div className="text-4xl">🛣️</div><h2 className="mt-3 text-xl font-black">No journeys published yet</h2><p className="mt-2 text-sm text-slate-600">Once your driver verification is approved, publish a shared journey to offer seats to other travellers.</p><Link href="/trips/new" className="mt-5 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-extrabold text-white">Publish your first journey →</Link></section> : <section className="mt-6 space-y-4">{trips.map(trip => <article key={trip.id} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold uppercase text-sky-800">{trip.status}</span><h2 className="mt-3 text-xl font-black">{trip.origin_city} <span className="text-sky-600">→</span> {trip.destination_city}</h2><p className="mt-2 text-sm text-slate-600">{date(trip.departure_at)} · {trip.vehicle_type === "motorcycle" ? "Motorcycle" : "Car"}</p></div><div className="text-left sm:text-right"><p className="text-2xl font-black">{money(trip.price_per_seat)}</p><p className="text-xs text-slate-500">per seat</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-sky-50 p-3"><p className="text-xs text-slate-500">Seats available</p><p className="mt-1 text-lg font-black">{trip.seats_available} / {trip.seats_total}</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-slate-500">Pending requests</p><p className="mt-1 text-lg font-black">{trip.pending_requests}</p></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-slate-500">Confirmed bookings</p><p className="mt-1 text-lg font-black">{trip.confirmed_bookings}</p></div></div>{trip.notes && <p className="mt-4 text-sm leading-6 text-slate-600">{trip.notes}</p>}<div className="mt-4 flex flex-wrap gap-2"><Link href="/driver/rides" className="rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-50">Manage seat requests →</Link>{trip.status !== "cancelled" && trip.status !== "completed" && trip.confirmed_bookings === 0 && new Date(trip.departure_at).getTime() > Date.now() && <button disabled={busy === trip.id} onClick={() => void cancelTrip(trip)} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 disabled:opacity-50">{busy === trip.id ? "Cancelling…" : "Cancel journey"}</button>}</div></article>)}</section>}
      <footer className="py-7 text-center text-xs text-slate-500">Only your own published journeys are shown here.</footer>
    </div>
  </main>;
}
