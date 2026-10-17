"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Trip = {
  id: string;
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
  const [signedIn, setSignedIn] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        setSignedIn(false);
        setTrips([]);
        setMessage("Please sign in to find available journeys.");
        return;
      }

      setSignedIn(true);

      const { data, error } = await supabase
        .from("trips")
        .select(
          "id, origin_city, destination_city, departure_at, vehicle_type, seats_available, price_per_seat, notes"
        )
        .eq("status", "open")
        .gt("departure_at", new Date().toISOString())
        .gt("seats_available", 0)
        .order("departure_at", { ascending: true });

      if (error) throw error;

      setTrips((data ?? []) as Trip[]);
      setMessage(
        data?.length ? "" : "No upcoming journeys yet. Check again later or publish your own."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load journeys. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-semibold text-blue-700">
          ← RideMitra home
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-blue-700">RIDEMITRA</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Find a journey
            </h1>
            <p className="mt-2 text-slate-600">
              Find a ride that matches your route and travel plans.
            </p>
          </div>

          <Link
            href="/trips/new"
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            + Publish a journey
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Search by route</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              From city
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="mt-1 w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              To city
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Vijayawada"
                className="mt-1 w-full rounded-lg border border-slate-300 p-3"
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
            <h2 className="text-xl font-bold text-slate-900">
              Available journeys
            </h2>
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
              {!signedIn && (
                <Link
                  href="/login"
                  className="mt-3 inline-block font-semibold text-blue-700 underline"
                >
                  Sign in
                </Link>
              )}
            </div>
          )}

          {!loading && signedIn && filteredTrips.length === 0 && trips.length > 0 && (
            <p className="mt-4 rounded-xl bg-white p-5 text-slate-600">
              No journeys match those cities. Try another search.
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
                    <p className="text-lg font-bold text-slate-900">
                      {trip.origin_city} <span className="text-blue-700">→</span>{" "}
                      {trip.destination_city}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {new Date(trip.departure_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-700">
                    ₹{Number(trip.price_per_seat).toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-slate-500">
                      {" "}/ seat
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {trip.vehicle_type === "car" ? "Car" : "Motorcycle"}
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
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
