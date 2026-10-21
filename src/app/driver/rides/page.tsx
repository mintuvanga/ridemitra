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
    <main className="min-h-screen bg-[#071827] px-3 pb-28 pt-3 text-[#edf7f7] sm:px-4">
      <div className="mx-auto w-full max-w-[520px]">
        <header className="sticky top-0 z-[800] flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#071827]/95 px-3 py-3 shadow-lg backdrop-blur-xl">
          <Link href="/driver" className="text-lg font-black tracking-tight">Ride<span className="text-emerald-300">Mitra</span><span className="ml-2 text-xs font-semibold text-slate-400">Driver</span></Link>
          <Link href="/support" className="min-h-10 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10">Contact Support ↗</Link>
        </header>

        <section className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d2b40] to-[#0b3b3a] p-5 text-white shadow-xl shadow-black/10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-200">Driver workspace</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Your rides</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Review real booking requests for journeys you created, accept or reject requests, and navigate with Google Maps.</p>
            </div>
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 text-3xl sm:flex sm:self-auto" aria-hidden="true">🛺</div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-3 gap-2">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0b2234] p-3 shadow-lg shadow-black/5 sm:p-4"><p className="text-[10px] font-semibold leading-4 text-slate-400 sm:text-xs">New requests</p><p className="mt-2 text-2xl font-black text-slate-100 sm:text-3xl">{pending.length}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Waiting for your decision</p></div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0b2234] p-3 shadow-lg shadow-black/5 sm:p-4"><p className="text-[10px] font-semibold leading-4 text-slate-400 sm:text-xs">Accepted rides</p><p className="mt-2 text-2xl font-black text-slate-100 sm:text-3xl">{upcoming.length}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Confirmed bookings</p></div>
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0b2234] p-3 shadow-lg shadow-black/5 sm:p-4"><p className="text-[10px] font-semibold leading-4 text-slate-400 sm:text-xs">Finished / rejected</p><p className="mt-2 text-2xl font-black text-slate-100 sm:text-3xl">{completed.length}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Past booking activity</p></div>
        </section>

        <section className="mt-4 rounded-3xl border border-white/10 bg-[#0b2234] p-4 shadow-xl shadow-black/5 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-black">Ride activity</h2><p className="mt-1 text-xs leading-5 text-slate-400">Booking data refreshes automatically every 15 seconds.</p></div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-500 sm:inline">{lastUpdated ? `Updated ${lastUpdated}` : ""}</span>
              <button type="button" onClick={() => void loadBookings(true)} disabled={refreshing || loading} className="min-h-10 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:opacity-50">{refreshing ? "Refreshing…" : "↻ Refresh"}</button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 rounded-xl border border-white/10 bg-[#071827] p-1 text-[11px] font-bold sm:text-sm">
            {([[ "available", "New requests" ], [ "upcoming", "Accepted" ], [ "completed", "History" ]] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-lg px-1.5 py-2.5 transition sm:px-3 ${tab === key ? "bg-emerald-300/10 text-emerald-200 shadow-sm" : "text-slate-400 hover:text-slate-100"}`}>{label}</button>)}
          </div>

          {error && <div role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100"><strong>Unable to load/update rides.</strong> {error} <button type="button" onClick={() => void loadBookings()} className="ml-2 font-bold underline">Try again</button></div>}
          {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-100">{notice}</p>}

          {loading ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#071827] px-4 py-10 text-center text-sm font-semibold text-slate-300">Loading your booking requests…</div>
          ) : visibleBookings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-[#071827] px-4 py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl" aria-hidden="true">{tab === "available" ? "🧭" : tab === "upcoming" ? "🗓️" : "🧾"}</div>
              <h3 className="mt-4 text-base font-extrabold">{tab === "available" ? "No new booking requests" : tab === "upcoming" ? "No accepted rides" : "No ride history yet"}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{tab === "available" ? "New requests from passengers for your listed journeys will appear here." : tab === "upcoming" ? "When you accept a passenger request, it will appear here." : "Accepted rides that are completed or rejected requests will appear here."}</p>
              <Link href="/trips" className="mt-5 inline-flex items-center justify-center min-h-11 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-extrabold text-emerald-200 hover:bg-white/10">View journeys <span className="ml-2" aria-hidden="true">→</span></Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {visibleBookings.map((booking) => (
                <article key={booking.booking_id} className="rounded-2xl border border-white/10 bg-[#071827] p-3.5 shadow-lg shadow-black/5 sm:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-200">{booking.vehicle_type === "motorcycle" ? "Bike ride" : "Car ride"} · {booking.seats_requested} seat{booking.seats_requested === 1 ? "" : "s"}</p>
                      <h3 className="mt-1 text-base font-black sm:text-lg">{booking.passenger_name || "Passenger"}</h3>
                      <p className="mt-1 text-xs text-slate-400">Requested {formatDate(booking.created_at)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${booking.booking_status === "pending" ? "bg-amber-100 text-amber-800" : booking.booking_status === "confirmed" ? "bg-emerald-100 text-emerald-800" : booking.booking_status === "completed" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"}`}>{booking.booking_status === "pending" ? "Needs response" : booking.booking_status === "confirmed" ? "Accepted" : booking.booking_status === "completed" ? "Completed" : "Rejected / cancelled"}</span>
                  </div>
                  <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-white/5 bg-[#0b2234] p-3 sm:grid-cols-2 sm:p-4">
                    <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Pickup / origin</p><p className="mt-1 break-words text-sm font-bold text-slate-100">{booking.origin_city}</p></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 break-words text-sm font-bold text-slate-100">{booking.destination_city}</p></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Departure</p><p className="mt-1 break-words text-sm font-semibold text-slate-200">{formatDate(booking.departure_at)}</p></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Fare per seat</p><p className="mt-1 text-sm font-extrabold text-emerald-200">₹{Number(booking.price_per_seat || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p></div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                    {booking.booking_status === "pending" && <>
                      <button type="button" disabled={busyId === booking.booking_id} onClick={() => void updateBooking(booking, "accept")} className="min-h-11 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-extrabold text-[#062033] hover:brightness-105 disabled:opacity-50">{busyId === booking.booking_id ? "Updating…" : "Accept & open Maps ↗"}</button>
                      <button type="button" disabled={busyId === booking.booking_id} onClick={() => void updateBooking(booking, "reject")} className="min-h-11 rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-2.5 text-sm font-extrabold text-rose-100 hover:bg-rose-300/15 disabled:opacity-50">Reject</button>
                    </>}
                    {booking.booking_status === "confirmed" && <>
                      <button type="button" onClick={() => window.open(mapsUrl(booking.origin_city, booking.destination_city), "_blank", "noopener,noreferrer")} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700">Open Google Maps ↗</button>
                      <button type="button" disabled={busyId === booking.booking_id} onClick={() => void updateBooking(booking, "complete")} className="min-h-11 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2.5 text-sm font-extrabold text-emerald-100 hover:bg-emerald-300/15 disabled:opacity-50">{busyId === booking.booking_id ? "Updating…" : "Mark completed"}</button>
                    </>}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100"><strong>Driver verification:</strong> Driver identity and vehicle verification are not yet connected to an authoritative review service. This page shows actual database bookings for journeys owned by your account; it does not mean the driver is verified or provide live GPS tracking.</div>
        </section>

        <nav aria-label="Driver app navigation" className="fixed inset-x-0 bottom-0 z-[850] border-t border-white/10 bg-[#071827]/95 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur-xl">
          <div className="mx-auto grid w-full max-w-[520px] grid-cols-4 gap-1">
            <Link href="/driver/instant-rides" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-emerald-200">
              <span className="text-xl leading-5">⌂</span><span className="text-[10px] font-extrabold">Home</span>
            </Link>
            <Link href="/driver/new-ride-requests" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-emerald-200">
              <span className="text-xl leading-5">＋</span><span className="text-[10px] font-extrabold">New rides</span>
            </Link>
            <Link href="/driver/earnings" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-slate-100">
              <span className="text-xl leading-5">₹</span><span className="text-[10px] font-extrabold">Earnings</span>
            </Link>
            <Link href="/driver/instant-rides" aria-label="More options" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-slate-100">
              <span className="text-2xl leading-5">⋯</span><span className="text-[10px] font-extrabold">More</span>
            </Link>
          </div>
        </nav>
        <footer className="pb-4 pt-7 text-center text-[10px] text-slate-500">RideMitra Driver · Booking data comes from the RideMitra database.</footer>
      </div>
    </main>
  );
}
