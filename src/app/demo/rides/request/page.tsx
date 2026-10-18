"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const sampleRide: DemoRide = {
  id: "DM-1056",
  pickup: "Ameerpet Metro Station, Hyderabad",
  destination: "HITEC City, Mindspace, Hyderabad",
  vehicle: "Auto",
  fare: 185,
  status: "requested",
  createdAt: new Date().toISOString(),
};

export default function IncomingRideRequestPage() {
  const router = useRouter();
  const [ride, setRide] = useState<DemoRide | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const sync = () => {
      try {
        const saved = localStorage.getItem(KEY);
        setRide(saved ? (JSON.parse(saved) as DemoRide) : null);
      } catch { setRide(null); }
    };
    sync();
    window.addEventListener("storage", sync);
    const timer = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(timer);
    };
  }, []);

  function decide(next: "accepted" | "rejected") {
    const current = ride ?? sampleRide;
    const updated = { ...current, status: next };
    localStorage.setItem(KEY, JSON.stringify(updated));
    setRide(updated);
    setNotice(next === "accepted" ? "Passenger demo status updated to accepted." : "Passenger demo status updated to rejected.");
    if (next === "accepted") {
      const url = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(current.pickup) + "&destination=" + encodeURIComponent(current.destination) + "&travelmode=driving";
      window.open(url, "_blank", "noopener,noreferrer");
      router.push("/demo/rides/active");
    }
  }

  const current = ride ?? sampleRide;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-7 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
          <Link href="/demo" className="text-xl font-black">Ride<span className="text-sky-600">Mitra</span></Link>
          <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-800">DRIVER DEMO</span>
        </header>
        <section className="mt-6 rounded-3xl bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100">Incoming request · {current.id}</p>
          <h1 className="mt-2 text-3xl font-black">Ride request</h1>
          <p className="mt-2 text-sm text-sky-50">Review the passenger demo request and choose an action.</p>
        </section>
        {!ride && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">No passenger demo request is saved yet. This sample request is shown for preview. For a connected test, open the passenger demo and request a ride first.</p>}
        <section className="mt-5 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-semibold text-slate-500">Illustrative fare</p>
          <p className="mt-1 text-4xl font-black text-sky-700">₹{current.fare}</p>
          <p className="mt-1 text-xs text-slate-500">Demo only · no payment</p>
          <div className="mt-5 rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-bold uppercase text-slate-500">Pickup location</p><p className="mt-1 font-extrabold">{current.pickup}</p>
            <div className="my-4 border-t border-slate-100" />
            <p className="text-xs font-bold uppercase text-slate-500">Destination</p><p className="mt-1 font-extrabold">{current.destination}</p>
            <p className="mt-4 text-sm text-slate-500">Vehicle: <strong className="text-slate-800">{current.vehicle}</strong></p>
            <p className="mt-1 text-sm text-slate-500">Passenger: <strong className="text-slate-800">Demo Passenger</strong></p>
          </div>
          {notice && <p role="status" className="mt-4 rounded-xl bg-sky-50 p-3 text-sm text-sky-800">{notice}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => decide("rejected")} className="min-h-14 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 font-extrabold text-rose-700 hover:bg-rose-100">× Reject ride</button>
            <button type="button" onClick={() => decide("accepted")} className="min-h-14 rounded-2xl bg-emerald-600 px-4 py-3 font-extrabold text-white hover:bg-emerald-700">✓ Accept ride</button>
          </div>
          <Link href="/demo/passenger" className="mt-4 block rounded-xl border border-sky-200 px-4 py-3 text-center font-bold text-sky-700 hover:bg-sky-50">View passenger demo status →</Link>
          <Link href="/demo/rides" className="mt-4 block text-center text-sm font-bold text-sky-700">← Back to driver rides</Link>
        </section>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Demo only:</strong> actions update the passenger demo in the same browser. No real ride is dispatched or booked.</p>
      </div>
    </main>
  );
}
