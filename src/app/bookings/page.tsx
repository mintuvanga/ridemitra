"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type TripSummary = {
  origin_city: string;
  destination_city: string;
  departure_at: string;
  vehicle_type: "car" | "motorcycle";
  price_per_seat: number;
};

type Booking = {
  id: string;
  trip_id: string;
  passenger_id: string;
  seats_requested: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  trip: TripSummary | null;
};

function statusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-rose-50 text-rose-700";
    case "completed":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        setSignedIn(false);
        setBookings([]);
        setMessage(result.error || "Sign in to see your seat requests.");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Unable to load your bookings.");
      setSignedIn(true);
      setBookings((result.bookings ?? []) as Booking[]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 sm:py-6">
      <div className="mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#f8fafc] shadow-xl sm:min-h-[850px] sm:rounded-[2rem] sm:border sm:border-slate-200">
        <header className="border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight">
              Ride<span className="text-emerald-600">Mitra</span>
            </Link>
            <span className="text-2xl">🎫</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Your journeys, all in one place
          </p>
        </header>

        <div className="px-4 pb-28 pt-5">
          <Link
            href="/trips"
            className="text-sm font-semibold text-emerald-700"
          >
            ← Find journeys
          </Link>

          <section className="mt-4 rounded-3xl bg-emerald-700 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
              Your travel activity
            </p>
            <h1 className="mt-2 text-3xl font-black">My Bookings</h1>
            <p className="mt-2 text-sm leading-6 text-emerald-50">
              Keep track of your seat requests and journey details.
            </p>
            <div className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </div>
          </section>

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-lg font-black">Your requests</h2>
            <button
              type="button"
              onClick={() => void loadBookings()}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          {loading && (
            <div className="mt-4 rounded-2xl bg-white p-6 text-center text-sm text-slate-500">
              Loading your bookings...
            </div>
          )}

          {!loading && message && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <div className="text-4xl">🧳</div>
              <p className="mt-3 break-words text-sm text-slate-600">
                {message}
              </p>
              {!signedIn && (
                <Link
                  href="/login"
                  className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          )}

          {!loading && !message && bookings.length === 0 && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <div className="text-5xl">🛣️</div>
              <h3 className="mt-4 text-lg font-bold">No bookings yet</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                When you request a seat, your journey and its status will
                appear here.
              </p>
              <Link
                href="/trips"
                className="mt-5 inline-block w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white"
              >
                Find a journey
              </Link>
            </div>
          )}

          <div className="mt-4 space-y-4">
            {bookings.map((booking) => {
              const trip = booking.trip;

              return (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                      {trip?.vehicle_type === "motorcycle"
                        ? "🏍️ Bike ride"
                        : "🚗 Journey"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {trip ? (
                    <>
                      <div className="mt-4">
                        <h3 className="break-words text-lg font-black">
                          {trip.origin_city}
                        </h3>
                        <p className="my-1 text-xs text-slate-400">
                          ↓ Journey destination
                        </p>
                        <h3 className="break-words text-lg font-black">
                          {trip.destination_city}
                        </h3>
                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        🗓️{" "}
                        {new Date(trip.departure_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-xs text-slate-400">Seats requested</p>
                          <p className="mt-1 font-bold">
                            {booking.seats_requested}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Price per seat</p>
                          <p className="mt-1 font-black text-emerald-700">
                            ₹{Number(trip.price_per_seat).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-700">
                        Journey details are unavailable
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        The journey may no longer be visible under the current
                        access rules. Your booking status is shown above.
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Booking reference: {booking.id.slice(0, 8)}
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-[11px] text-slate-400">
                    Requested{" "}
                    {new Date(booking.created_at).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </p>

                  {booking.status === "pending" && (
                    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                      Your request is waiting for the driver to respond.
                    </p>
                  )}

                  {booking.status === "confirmed" && (
                    <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                      Your booking is confirmed. Check your journey details
                      before travelling.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto grid w-full max-w-md grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:bottom-6 sm:rounded-b-[2rem]">
          <Link href="/" className="flex flex-col items-center gap-1 py-2 text-slate-500">
            <span className="text-xl">⌂</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/trips" className="flex flex-col items-center gap-1 py-2 text-slate-500">
            <span className="text-xl">⌕</span>
            <span className="text-[10px] font-semibold">Find rides</span>
          </Link>
          <Link href="/bookings" className="flex flex-col items-center gap-1 py-2 text-emerald-700">
            <span className="text-xl">🎫</span>
            <span className="text-[10px] font-bold">Bookings</span>
          </Link>
          <Link href="/trips/new" className="flex flex-col items-center gap-1 py-2 text-slate-500">
            <span className="text-xl">＋</span>
            <span className="text-[10px] font-semibold">Publish</span>
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
