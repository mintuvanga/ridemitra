"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Trip = {
  id: string;
  driver_id: string;
  origin_city: string;
  destination_city: string;
  departure_at: string;
  vehicle_type: "car" | "motorcycle";
  seats_available: number;
  price_per_seat: number;
  notes: string | null;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("Loading journeys...");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [busyTripId, setBusyTripId] = useState("");
  const [bookingMessages, setBookingMessages] = useState<Record<string, string>>({});

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/trips", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load journeys.");
      setUserId(result.user?.id ?? "");
      const data = (result.trips ?? []) as Trip[];
      setTrips(data);
      setMessage(data.length ? "" : "No upcoming journeys yet. Be the first to publish one!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load journeys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

  async function requestSeat(trip: Trip) {
    if (!userId) {
      setBookingMessages((previous) => ({
        ...previous,
        [trip.id]: "Please sign in before requesting a seat.",
      }));
      return;
    }

    if (trip.driver_id === userId) return;

    setBusyTripId(trip.id);
    setBookingMessages((previous) => ({ ...previous, [trip.id]: "" }));

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip_id: trip.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send request.");
      setBookingMessages((previous) => ({
        ...previous,
        [trip.id]: result.message || "Seat request sent! Waiting for driver confirmation.",
      }));
    } catch (error) {
      setBookingMessages((previous) => ({
        ...previous,
        [trip.id]: error instanceof Error ? error.message : "Unable to send request.",
      }));
    } finally {
      setBusyTripId("");
    }
  }

  const filteredTrips = trips.filter((trip) =>
    trip.origin_city.toLowerCase().includes(origin.trim().toLowerCase()) &&
    trip.destination_city.toLowerCase().includes(destination.trim().toLowerCase())
  );

  return (
    <main className="rm-page-enter min-h-screen bg-slate-100 text-slate-900 sm:py-6">
      <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#f8fafc] shadow-xl sm:min-h-[850px] sm:rounded-[2rem] sm:border sm:border-slate-200">
        <header className="rm-slide-down sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight text-slate-900">
              Ride<span className="text-emerald-600">Mitra</span>
            </Link>
            <Link href="/login" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xl">
              👤
            </Link>
          </div>
          <p className="mt-1 text-xs text-slate-500">Your people. Your journey. 🇮🇳</p>
        </header>

        <div className="px-4 pb-28 pt-5">
          <section className="rm-card-enter rm-glow relative overflow-hidden rounded-3xl bg-emerald-700 p-5 text-white">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                Travel together
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight">
                Where are<br />you heading?
              </h1>
              <p className="mt-2 max-w-[230px] text-sm leading-5 text-emerald-50">
                Find a journey and share the road with fellow travellers.
              </p>
            </div>
            <div className="absolute -right-2 bottom-0 text-7xl opacity-90">🚗</div>
          </section>

          <section className="rm-card-enter rm-delay-1 mt-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold">Find your route</h2>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
              <span className="text-emerald-600">●</span>
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">From</span>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Starting city"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </span>
            </label>

            <div className="ml-5 h-3 border-l border-dashed border-slate-300" />

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
              <span className="text-rose-500">●</span>
              <span className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">To</span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination city"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </span>
            </label>

            <button
              type="button"
              onClick={() => void loadTrips()}
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Finding journeys..." : "Find journeys"}
            </button>

            {(origin || destination) && (
              <button
                type="button"
                onClick={() => {
                  setOrigin("");
                  setDestination("");
                }}
                className="mt-2 w-full py-1 text-xs font-semibold text-slate-500"
              >
                Clear route filters
              </button>
            )}
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Upcoming journeys</h2>
                <p className="text-xs text-slate-500">Find a ride that fits your plans</p>
              </div>
              <button
                type="button"
                onClick={() => void loadTrips()}
                disabled={loading}
                aria-label="Refresh journeys"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg disabled:opacity-50"
              >
                ↻
              </button>
            </div>

            {!loading && message && (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                <div className="text-4xl">🛣️</div>
                <p className="mt-3 text-sm text-slate-600">{message}</p>
                {!userId && (
                  <Link href="/login" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white">
                    Sign in
                  </Link>
                )}
                <Link href="/trips/new" className="mt-3 block text-sm font-bold text-emerald-700">
                  + Publish a journey
                </Link>
              </div>
            )}

            {!loading && userId && filteredTrips.length === 0 && trips.length > 0 && (
              <div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500">
                No journeys match those cities. Try another route.
              </div>
            )}

            <div className="rm-stagger space-y-3">
              {filteredTrips.map((trip) => (
                <article key={trip.id} className="rm-card-enter rm-tap rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      {trip.vehicle_type === "car" ? "🚗 Car ride" : "🏍️ Bike ride"}
                    </span>
                    <span className="text-right text-lg font-black text-emerald-700">
                      ₹{Number(trip.price_per_seat).toLocaleString("en-IN")}
                      <span className="block text-[10px] font-medium text-slate-400">per seat</span>
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="flex w-4 flex-col items-center pt-1">
                      <span className="h-2.5 w-2.5 rounded-full border-2 border-emerald-600" />
                      <span className="my-1 h-8 border-l-2 border-dashed border-slate-300" />
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold">{trip.origin_city}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(trip.departure_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <h3 className="mt-3 break-words text-base font-bold">{trip.destination_city}</h3>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span>💺 {trip.seats_available} seats left</span>
                    <span>🛡️ Plan safely</span>
                  </div>

                  {trip.notes && (
                    <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">{trip.notes}</p>
                  )}

                  {trip.driver_id === userId ? (
                    <p className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500">
                      This is your journey
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void requestSeat(trip)}
                      disabled={busyTripId === trip.id}
                      className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busyTripId === trip.id ? "Sending request..." : "Request a seat →"}
                    </button>
                  )}

                  {bookingMessages[trip.id] && (
                    <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                      {bookingMessages[trip.id]}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          <Link href="/trips/new" className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-100 p-4 text-sm font-bold text-emerald-800">
            <span className="text-xl">＋</span> Publish your own journey
          </Link>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto grid w-full max-w-md grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]">
          <Link href="/" className="flex flex-col items-center gap-1 py-2 text-slate-500">
            <span className="text-xl">⌂</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/trips" className="flex flex-col items-center gap-1 py-2 text-emerald-700">
            <span className="text-xl">⌕</span>
            <span className="text-[10px] font-bold">Find rides</span>
          </Link>
          <Link href="/trips/new" className="flex flex-col items-center gap-1 py-2 text-slate-500">
            <span className="text-xl">＋</span>
            <span className="text-[10px] font-semibold">Publish</span>
          </Link>
          <Link href="/bookings" className="flex flex-col items-center gap-1 py-2 text-slate-500">
            <span className="text-xl">🎫</span>
            <span className="text-[10px] font-semibold">Bookings</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-1 py-2 text-slate-500">
            <span className="text-xl">♙</span>
            <span className="text-[10px] font-semibold">Account</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}



