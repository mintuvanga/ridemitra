"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Tracking = {
  id: string; status: string; pickup: string; destination: string; driver_name: string | null;
  driver_location: { latitude: number; longitude: number; updated_at: string } | null;
};

export default function RideTrackingPage() {
  const params = useSearchParams();
  const rideId = params.get("ride");
  const [ride, setRide] = useState<Tracking | null>(null);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");
  const load = useCallback(async () => {
    if (!rideId) { setError("A ride ID is required to view tracking."); return; }
    try {
      const response = await fetch("/api/instant-rides/" + encodeURIComponent(rideId) + "/tracking", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load tracking.");
      setRide(data.ride); setError(""); setUpdated(new Date().toLocaleTimeString());
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load tracking."); }
  }, [rideId]);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 5000); return () => window.clearInterval(timer); }, [load]);
  const loc = ride?.driver_location;
  const mapUrl = loc ? "https://www.openstreetmap.org/export/embed.html?bbox=" +
    (loc.longitude - 0.015) + "%2C" + (loc.latitude - 0.01) + "%2C" +
    (loc.longitude + 0.015) + "%2C" + (loc.latitude + 0.01) +
    "&layer=mapnik&marker=" + loc.latitude + "%2C" + loc.longitude : "";
  return <main className="min-h-screen bg-slate-50 px-3 py-5 text-slate-900 sm:px-6 sm:py-8">
    <div className="mx-auto max-w-3xl">
      <header className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <Link href="/" className="text-lg font-black">Ride<span className="text-sky-600">Mitra</span></Link>
        <Link href="/driver/instant-rides" className="text-sm font-bold text-sky-700">Driver mode ↗</Link>
      </header>
      <section className="mt-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-5 text-white sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-100">Ride status</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Live ride tracking</h1>
        <p className="mt-2 text-sm text-sky-50">Location refreshes automatically every 5 seconds while the ride is active.</p>
      </section>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {ride && <><section className="mt-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">{ride.status.replaceAll("_", " ")}</h2><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">{ride.driver_name || "Driver assigned"}</span></div>
        <p className="mt-4 text-xs font-bold uppercase text-slate-500">Pickup</p><p className="font-semibold">{ride.pickup}</p>
        <p className="mt-3 text-xs font-bold uppercase text-slate-500">Destination</p><p className="font-semibold">{ride.destination}</p>
        <p className="mt-3 text-xs text-slate-500">Page refreshed: {updated}</p>
      </section>
      <section className="mt-4 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
        <div className="p-4"><h2 className="font-black">Driver location</h2><p className="mt-1 text-sm text-slate-600">{loc ? "Last GPS update: " + new Date(loc.updated_at).toLocaleString() : "Waiting for the driver's next GPS update."}</p></div>
        {loc ? <iframe title="Live driver location map" className="h-80 w-full border-0 sm:h-96" loading="lazy" referrerPolicy="no-referrer" src={mapUrl} /> : <div className="flex h-64 items-center justify-center bg-sky-50 px-6 text-center text-sm text-slate-600">The map will appear when the driver has shared a GPS location during this active ride.</div>}
      </section></>}
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Tracking is available only to the signed-in passenger or assigned driver. GPS updates depend on the driver's browser location permission and online status.</p>
    </div>
  </main>;
}
