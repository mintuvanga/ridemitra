"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type RideBooking = {
  booking_id: string;
  trip_id: string;
  seats_requested: number;
  booking_status: "pending" | "confirmed" | "cancelled" | "completed" | string;
  created_at: string;
  origin_city: string;
  destination_city: string;
  departure_at: string;
  vehicle_type: "car" | "motorcycle" | string;
  price_per_seat: string | number;
  passenger_name: string | null;
};

type RideTab = "available" | "upcoming" | "completed";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function mapsUrl(origin: string, destination: string) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

export default function DriverRidesPage() {
  const [tab, setTab] = useState<RideTab>("available");
  const [bookings, setBookings] = useState<RideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadBookings = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/driver/bookings", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (response.status === 401 ? "Sign in to see ride requests." : "Could not load rides."));
      setBookings(Array.isArray(result.bookings) ? result.bookings : []);
      setError("");
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load rides.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
    const interval = window.setInterval(() => void loadBookings(true), 15000);
    return () => window.clearInterval(interval);
  }, [loadBookings]);

  const pending = useMemo(() => bookings.filter((booking) => booking.booking_status === "pending"), [bookings]);
  const upcoming = useMemo(() => bookings.filter((booking) => booking.booking_status === "confirmed"), [bookings]);
  const completed = useMemo(() => bookings.filter((booking) => booking.booking_status === "completed" || booking.booking_status === "cancelled"), [bookings]);
  const visibleBookings = tab === "available" ? pending : tab === "upcoming" ? upcoming : completed;

  async function updateBooking(booking: RideBooking, action: "accept" | "reject" | "complete") {
    setError("");
    setNotice("");
    setBusyId(booking.booking_id);
    // Open a blank tab during the click gesture so browser popup protection does not block Maps after the API call.
    const mapsTab = action === "accept" ? window.open("about:blank", "_blank") : null;
    try {
      const response = await fetch(`/api/driver/bookings/${encodeURIComponent(booking.booking_id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update this ride.");
      if (action === "accept") {
        if (mapsTab) {
          mapsTab.opener = null;
          mapsTab.location.href = mapsUrl(booking.origin_city, booking.destination_city);
        } else {
          window.location.href = mapsUrl(booking.origin_city, booking.destination_city);
          return;
        }
        setNotice("Ride accepted. Google Maps has opened for navigation.");
      } else if (action === "reject") {
        mapsTab?.close();
        setNotice("Ride request rejected.");
      } else {
        setNotice("Ride marked as completed.");
      }
      await loadBookings(true);
    } catch (cause) {
      mapsTab?.close();
      setError(cause instanceof Error ? cause.message : "Unable to update this ride.");
    } finally {
      setBusyId("");
    }
  }

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
              <p className="mt-3 max-w-xl text-sm leading-6 text-sky-50 sm:text-base">Review real booking requests for journeys you created, accept or reject requests, and navigate with Google Maps.</p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-3xl border border-white/20 bg-white/10 text-4xl sm:self-auto" aria-hidden="true">🛺</div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">New requests</p><p className="mt-2 text-3xl font-black">{pending.length}</p><p className="mt-1 text-xs text-slate-500">Waiting for your decision</p></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">Accepted rides</p><p className="mt-2 text-3xl font-black">{upcoming.length}</p><p className="mt-1 text-xs text-slate-500">Confirmed bookings</p></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">Finished / rejected</p><p className="mt-2 text-3xl font-black">{completed.length}</p><p className="mt-1 text-xs text-slate-500">Past booking activity</p></div>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-2xl font-black">Ride activity</h2><p className="mt-1 text-sm text-slate-500">Booking data refreshes automatically every 15 seconds.</p></div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-400 sm:inline">{lastUpdated ? `Updated ${lastUpdated}` : ""}</span>
              <button type="button" onClick={() => void loadBookings(true)} disabled={refreshing || loading} className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50 disabled:opacity-50">{refreshing ? "Refreshing…" : "↻ Refresh"}</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-xs font-bold sm:text-sm">
            {([[ "available", "New requests" ], [ "upcoming", "Accepted" ], [ "completed", "History" ]] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-lg px-2 py-2.5 transition sm:px-3 ${tab === key ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{label}</button>)}
          </div>

          {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><strong>Unable to load/update rides.</strong> {error} <button type="button" onClick={() => void loadBookings()} className="ml-2 font-bold underline">Try again</button></div>}
          {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}

          {loading ? (
            <div className="mt-6 rounded-2xl bg-sky-50 px-5 py-12 text-center text-sm font-semibold text-slate-600">Loading your booking requests…</div>
          ) : visibleBookings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-5 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">{tab === "available" ? "🧭" : tab === "upcoming" ? "🗓️" : "🧾"}</div>
              <h3 className="mt-4 text-lg font-extrabold">{tab === "available" ? "No new booking requests" : tab === "upcoming" ? "No accepted rides" : "No ride history yet"}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{tab === "available" ? "New requests from passengers for your listed journeys will appear here." : tab === "upcoming" ? "When you accept a passenger request, it will appear here." : "Accepted rides that are completed or rejected requests will appear here."}</p>
              <Link href="/trips" className="mt-5 inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-5 py-3 text-sm font-extrabold text-sky-700 hover:bg-sky-50">View journeys <span className="ml-2" aria-hidden="true">→</span></Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {visibleBookings.map((booking) => (
                <article key={booking.booking_id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-sky-700">{booking.vehicle_type === "motorcycle" ? "Bike ride" : "Car ride"} · {booking.seats_requested} seat{booking.seats_requested === 1 ? "" : "s"}</p>
                      <h3 className="mt-1 text-lg font-black">{booking.passenger_name || "Passenger"}</h3>
                      <p className="mt-1 text-sm text-slate-500">Requested {formatDate(booking.created_at)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${booking.booking_status === "pending" ? "bg-amber-100 text-amber-800" : booking.booking_status === "confirmed" ? "bg-emerald-100 text-emerald-800" : booking.booking_status === "completed" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"}`}>{booking.booking_status === "pending" ? "Needs response" : booking.booking_status === "confirmed" ? "Accepted" : booking.booking_status === "completed" ? "Completed" : "Rejected / cancelled"}</span>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-xl bg-sky-50 p-4 sm:grid-cols-2">
                    <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Pickup / origin</p><p className="mt-1 font-bold">{booking.origin_city}</p></div>
                    <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 font-bold">{booking.destination_city}</p></div>
                    <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Departure</p><p className="mt-1 text-sm font-semibold">{formatDate(booking.departure_at)}</p></div>
                    <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Fare per seat</p><p className="mt-1 text-sm font-extrabold text-sky-800">₹{Number(booking.price_per_seat || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {booking.booking_status === "pending" && <>
                      <button type="button" disabled={busyId === booking.booking_id} onClick={() => void updateBooking(booking, "accept")} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700 disabled:opacity-50">{busyId === booking.booking_id ? "Updating…" : "Accept & open Maps ↗"}</button>
                      <button type="button" disabled={busyId === booking.booking_id} onClick={() => void updateBooking(booking, "reject")} className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-extrabold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Reject</button>
                    </>}
                    {booking.booking_status === "confirmed" && <>
                      <button type="button" onClick={() => window.open(mapsUrl(booking.origin_city, booking.destination_city), "_blank", "noopener,noreferrer")} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700">Open Google Maps ↗</button>
                      <button type="button" disabled={busyId === booking.booking_id} onClick={() => void updateBooking(booking, "complete")} className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-extrabold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">{busyId === booking.booking_id ? "Updating…" : "Mark completed"}</button>
                    </>}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900"><strong>Driver verification:</strong> Driver identity and vehicle verification are not yet connected to an authoritative review service. This page shows actual database bookings for journeys owned by your account; it does not mean the driver is verified or provide live GPS tracking.</div>
        </section>

        <nav className="mt-6 grid grid-cols-3 gap-3" aria-label="Driver navigation">
          <Link href="/driver" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">⌂</span><span className="mt-1 block">Dashboard</span></Link>
          <Link href="/driver/rides" aria-current="page" className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-center text-sm font-bold text-sky-700"><span className="block text-xl">🛺</span><span className="mt-1 block">My rides</span></Link>
          <Link href="/support" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">♡</span><span className="mt-1 block">Support</span></Link>
        </nav>
        <footer className="py-7 text-center text-xs text-slate-500">RideMitra Driver · Booking data comes from the RideMitra database.</footer>
      </div>
    </main>
  );
}
