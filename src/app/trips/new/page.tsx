"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewTripPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");
  const [vehicle, setVehicle] = useState("car");
  const [seats, setSeats] = useState("3");
  const [price, setPrice] = useState("0");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function publish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage("Please sign in before publishing a journey.");
        return;
      }

      const when = new Date(departure);

      if (!departure || Number.isNaN(when.getTime()) || when <= new Date()) {
        setMessage("Please choose a future departure date and time.");
        return;
      }

      if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
        setMessage("Choose two different cities.");
        return;
      }

      const { error } = await supabase.from("trips").insert({
        driver_id: user.id,
        origin_city: origin.trim(),
        destination_city: destination.trim(),
        departure_at: when.toISOString(),
        vehicle_type: vehicle,
        seats_total: Number(seats),
        seats_available: Number(seats),
        price_per_seat: Number(price),
        notes: notes.trim() || null,
        status: "open",
      });

      if (error) throw error;

      window.location.href = "/trips";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to publish journey.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <Link href="/trips" className="text-sm font-semibold text-blue-700">← Find journeys</Link>
      <h1 className="mt-6 text-3xl font-bold">Publish a journey</h1>
      <p className="mt-2 text-gray-600">Share your planned trip with other travellers.</p>

      <form onSubmit={publish} className="mt-8 space-y-5 rounded-2xl border p-5">
        <label className="block text-sm font-medium">From city
          <input required maxLength={100} className="mt-1 w-full rounded-lg border p-3" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Hyderabad" />
        </label>
        <label className="block text-sm font-medium">To city
          <input required maxLength={100} className="mt-1 w-full rounded-lg border p-3" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Vijayawada" />
        </label>
        <label className="block text-sm font-medium">Departure date and time
          <input required type="datetime-local" className="mt-1 w-full rounded-lg border p-3" value={departure} onChange={e => setDeparture(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Vehicle
          <select className="mt-1 w-full rounded-lg border p-3" value={vehicle} onChange={e => setVehicle(e.target.value)}>
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Available seats
          <select className="mt-1 w-full rounded-lg border p-3" value={seats} onChange={e => setSeats(e.target.value)}>
            {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Price per seat (₹)
          <input required type="number" min="0" max="100000" step="1" className="mt-1 w-full rounded-lg border p-3" value={price} onChange={e => setPrice(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Additional details (optional)
          <textarea maxLength={1000} rows={3} className="mt-1 w-full rounded-lg border p-3" value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
        <button disabled={busy} className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">
          {busy ? "Publishing..." : "Publish journey"}
        </button>
      </form>

      {message && <p role="status" className="mt-4 break-words rounded-lg bg-gray-50 p-4">{message}</p>}
    </main>
  );
}
