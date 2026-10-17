"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        setUserId("");
        setTrips([]);
        setMessage("Please sign in to find and request journeys.");
        return;
      }

      setUserId(authData.user.id);

      const { data, error } = await supabase
        .from("trips")
        .select(
          "id, driver_id, origin_city, destination_city, departure_at, vehicle_type, seats_available, price_per_seat, notes"
        )
        .eq("status", "open")
        .gt("departure_at", new Date().toISOString())
        .gt("seats_available", 0)
        .order("departure_at", { ascending: true });

      if (error) throw error;

      setTrips((data ?? []) as Trip[]);
      setMessage(
        data?.length
          ? ""
          : "No upcoming journeys are available yet. You can publish your own."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load journeys."
      );
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
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const { error } = await supabase.from("bookings").insert({
        trip_id: trip.id,
        passenger_id: authData.user.id,
        seats_requested: 1,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already requested this journey.");
        }
        throw error;
      }

      setBookingMessages((previous) => ({
        ...previous,
        [trip.id]: "Request sent! Your booking is pending driver confirmation.",
      }));
    } catch (error) {
      setBookingMessages((previous) => ({
        ...previous,
        [trip.id]:
          error instanceof Error ? error.message : "Unable to send request.",
      }));
    } finally {
      setBusyTripId("");
    }
  }

  const filteredTrips = trips.filter((trip) => {
    const fromMatches = trip.origin_city
      .toLowerCase()
      .includes(origin.trim().toLowerCase());
    const toMatches = trip.destination_city
      .toLowerCase()
      .includes(destination.trim().toLowerCase());

    return fromMatches && toMatches;
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-semibold text-blue-700">
          ← RideMitra home
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold tracking-widest text-emerald-700">RIDEMITRA</p>
            <h1 className="mt-2 text-3xl font-black">Find a journey</h1>
            <p className="mt-2 text-slate-600">
              Discover upcoming journeys and request a seat.
            </p>
          </div>
          <Link
            href="/trips/new"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            + Publish a journey
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Search by route</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              From city
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-normal"
              />
            </label>
            <label className="text-sm font-semibold">
              To city
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Vijayawada"
                className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-normal"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              setOrigin("");
              setDestination("");
            }}
            className="mt-4 text-sm font-semibold text-blue-700 underline"
          >
            Clear search
          </button>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Available journeys</h2>
            <button
              type="button"
              onClick={() => void loadTrips()}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {!loading && message && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
              <p>{message}</p>
              {!userId && (
                <Link
                  href="/login"
                  className="mt-3 inline-block font-semibold text-blue-700 underline"
                >
                  Sign in
                </Link>
              )}
            </div>
          )}

          {!loading && userId && filteredTrips.length === 0 && trips.length > 0 && (
            <p className="mt-4 rounded-xl bg-white p-5 text-slate-600">
              No journeys match your search. Try different cities.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {filteredTrips.map((trip) => (
              <article
                key={trip.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">
                      {trip.origin_city} <span className="text-emerald-600">→</span>{" "}
                      {trip.destination_city}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {new Date(trip.departure_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <p className="text-xl font-black text-emerald-700">
                    ₹{Number(trip.price_per_seat).toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-slate-500"> / seat</span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {trip.vehicle_type === "car" ? "🚗 Car" : "🏍️ Motorcycle"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {trip.seats_available} seats available
                  </span>
                </div>

                {trip.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                    {trip.notes}
                  </p>
                )}

                {trip.driver_id === userId ? (
                  <p className="mt-5 rounded-lg bg-slate-100 p-3 text-sm font-semibold text-slate-600">
                    This is your journey.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void requestSeat(trip)}
                    disabled={busyTripId === trip.id}
                    className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
                  >
                    {busyTripId === trip.id ? "Sending request..." : "Request a seat"}
                  </button>
                )}

                {bookingMessages[trip.id] && (
                  <p role="status" className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {bookingMessages[trip.id]}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
