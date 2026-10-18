"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DemoRide = {
  id: string;
  pickup: string;
  destination: string;
  vehicle: string;
  fare: number;
  status: "requested" | "accepted" | "rejected" | "completed";
  createdAt: string;
};

const KEY = "ridemitra_demo_ride";

export default function DemoPassengerPage() {
  const [pickup, setPickup] = useState("Ameerpet Metro Station, Hyderabad");
  const [destination, setDestination] = useState("HITEC City, Mindspace, Hyderabad");
  const [vehicle, setVehicle] = useState("Auto");
  const [ride, setRide] = useState<DemoRide | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setRide(JSON.parse(saved) as DemoRide);
    } catch {}
    const sync = () => {
      try {
        const saved = localStorage.getItem(KEY);
        setRide(saved ? (JSON.parse(saved) as DemoRide) : null);
      } catch {}
    };
    window.addEventListener("storage", sync);
    const timer = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(timer);
    };
  }, []);

  function requestRide() {
    if (!pickup.trim() || !destination.trim()) {
      setNotice("Enter both pickup and destination.");
      return;
    }
    const next: DemoRide = {
      id: "DM-" + String(Date.now()).slice(-6),
      pickup: pickup.trim(),
      destination: destination.trim(),
      vehicle,
      fare: vehicle === "Bike" ? 85 : vehicle === "Auto" ? 145 : 220,
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    setRide(next);
    setNotice("Demo request sent. Open the driver demo in another tab to respond.");
  }

  function resetDemo() {
    localStorage.removeItem(KEY);
    setRide(null);
    setNotice("Demo ride cleared. You can request another ride.");
  }

  const statusText = ride?.status === "requested" ? "Waiting for driver" :
    ride?.status === "accepted" ? "Driver accepted your request" :
    ride?.status === "rejected" ? "Driver rejected this request" :
    ride?.status === "completed" ? "Demo ride completed" : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-7 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
          <Link href="/demo" className="text-xl font-black">Ride<span className="text-sky-600">Mitra</span></Link>
          <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-800">PASSENGER DEMO</span>
        </header>

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-6 text-white sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-100">Test workspace · Passenger</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Book a demo ride</h1>
          <p className="mt-3 text-sm leading-6 text-sky-50">Create a sample request and watch its status update when the driver demo accepts or rejects it.</p>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <label className="block text-sm font-bold" htmlFor="pickup">Pickup location</label>
          <input id="pickup" value={pickup} onChange={e => setPickup(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          <label className="mt-4 block text-sm font-bold" htmlFor="destination">Destination</label>
          <input id="destination" value={destination} onChange={e => setDestination(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          <label className="mt-4 block text-sm font-bold" htmlFor="vehicle">Vehicle</label>
          <select id="vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500">
            <option>Auto</option><option>Bike</option><option>Car</option>
          </select>
          <button type="button" onClick={requestRide} className="mt-5 w-full rounded-xl bg-sky-600 px-5 py-4 font-extrabold text-white hover:bg-sky-700">Request demo ride</button>
          {notice && <p role="status" className="mt-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-800">{notice}</p>}
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Ride status</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">DEMO ONLY</span></div>
          {!ride ? <p className="mt-4 text-sm text-slate-500">No demo request yet. Submit the form above to begin.</p> : (
            <div className="mt-4 rounded-2xl border border-sky-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><p className="text-xs font-bold text-sky-700">{ride.id} · {ride.vehicle}</p><span className={"rounded-full px-3 py-1 text-xs font-extrabold " + (ride.status === "accepted" ? "bg-emerald-100 text-emerald-800" : ride.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800")}>{statusText}</span></div>
              <p className="mt-4 text-xs font-bold uppercase text-slate-500">Pickup</p><p className="mt-1 font-bold">{ride.pickup}</p>
              <p className="mt-3 text-xs font-bold uppercase text-slate-500">Destination</p><p className="mt-1 font-bold">{ride.destination}</p>
              <p className="mt-4 text-2xl font-black text-sky-700">₹{ride.fare}</p>
              <p className="mt-1 text-xs text-slate-500">Illustrative fare, not a quote or payment.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/demo/rides/request" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">Open driver demo →</Link>
                <button type="button" onClick={resetDemo} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Clear demo</button>
              </div>
            </div>
          )}
        </section>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Important:</strong> This demo uses this browser’s local storage. Keep the passenger and driver demos in tabs in the same browser. It does not contact real drivers, create database bookings, or process payments.</p>
        <Link href="/demo" className="mt-5 inline-flex font-bold text-sky-700">← Back to demo home</Link>
      </div>
    </main>
  );
}
