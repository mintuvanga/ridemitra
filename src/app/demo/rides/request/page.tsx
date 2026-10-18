"use client";

import Link from "next/link";
import { useState } from "react";

type Decision = "pending" | "accepted" | "rejected";

export default function IncomingRideRequestPage() {
  const [decision, setDecision] = useState<Decision>("pending");
  const [showNext, setShowNext] = useState(false);

  const ride = showNext
    ? { id: "DM-1057", pickup: "Madhapur Metro Station", destination: "Inorbit Mall, Cyberabad", distance: "6.8 km", time: "18 min", fare: "₹220", rider: "Demo Rider 2", initials: "R2" }
    : { id: "DM-1056", pickup: "Ameerpet Metro Station", destination: "HITEC City, Mindspace", distance: "8.2 km", time: "22 min", fare: "₹185", rider: "Demo Rider", initials: "DR" };

  function decide(next: Exclude<Decision, "pending">) {
    setDecision(next);
  }

  function nextRequest() {
    setShowNext(true);
    setDecision("pending");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
          <Link href="/demo" className="text-xl font-black">Ride<span className="text-sky-600">Mitra</span></Link>
          <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-800">DEMO REQUEST</span>
        </header>

        {decision === "pending" ? (
          <section className="mt-6 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl shadow-sky-100">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-7 text-white">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100">New ride request · {ride.id}</p><h1 className="mt-2 text-3xl font-black">Ride request!</h1><p className="mt-2 text-sm text-sky-50">Review the trip details and choose an action.</p></div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl" aria-hidden="true">🛺</div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
                <p className="text-sm font-semibold text-slate-500">Estimated fare</p>
                <p className="mt-1 text-4xl font-black text-sky-700">{ride.fare}</p>
                <p className="mt-1 text-xs text-slate-500">Sample fare · demo only</p>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 p-5">
                <div className="flex gap-3">
                  <div className="flex w-7 shrink-0 flex-col items-center pt-1"><span className="h-3 w-3 rounded-full border-[3px] border-sky-600 bg-white" /><span className="my-1 h-12 border-l-2 border-dashed border-slate-300" /><span className="h-3 w-3 rounded-sm bg-emerald-500" /></div>
                  <div className="min-w-0 flex-1 space-y-5">
                    <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pickup location</p><p className="mt-1 text-base font-extrabold">{ride.pickup}</p></div>
                    <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 text-base font-extrabold">{ride.destination}</p></div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div><p className="text-xs text-slate-500">Trip distance</p><p className="mt-1 font-extrabold">{ride.distance}</p></div>
                  <div><p className="text-xs text-slate-500">Estimated duration</p><p className="mt-1 font-extrabold">{ride.time}</p></div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 font-black text-sky-700">{ride.initials}</div>
                <div><p className="font-extrabold">{ride.rider}</p><p className="text-sm text-slate-500">Passenger profile · sample only</p></div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => decide("rejected")} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 font-extrabold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-lg text-white" aria-hidden="true">×</span> Reject ride</button>
                <button type="button" onClick={() => decide("accepted")} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-extrabold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-lg" aria-hidden="true">✓</span> Accept ride</button>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">Demo interaction only. This does not contact a passenger or dispatch a real ride.</p>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-7 text-center shadow-xl shadow-sky-100 sm:p-9">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-5xl font-black text-white ${decision === "accepted" ? "bg-emerald-500" : "bg-rose-500"}`} aria-hidden="true">{decision === "accepted" ? "✓" : "×"}</div>
            <h1 className="mt-5 text-3xl font-black">{decision === "accepted" ? "Ride accepted!" : "Ride rejected"}</h1>
            <p className="mt-3 leading-6 text-slate-600">{decision === "accepted" ? "This sample request is now marked accepted in this demo screen." : "This sample request has been declined. You can return to rides or try another demo request."}</p>
            <div className="mt-5 rounded-2xl bg-sky-50 p-5 text-left">
              <div className="flex justify-between gap-3"><span className="text-sm text-slate-500">Destination</span><span className="text-right font-bold">{ride.destination}</span></div>
              <div className="mt-3 flex justify-between gap-3"><span className="text-sm text-slate-500">Sample fare</span><span className="font-black text-sky-700">{ride.fare}</span></div>
              <div className="mt-3 flex justify-between gap-3"><span className="text-sm text-slate-500">Request</span><span className="font-bold">{ride.id}</span></div>
            </div>
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs leading-5 text-amber-900">Demo only: no live ride has been accepted or rejected, and no payment is made.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {decision === "rejected" && !showNext ? <button onClick={nextRequest} type="button" className="rounded-xl bg-sky-600 px-4 py-3 font-extrabold text-white hover:bg-sky-700">Show another request</button> : null}
              <Link href="/demo/rides" className="rounded-xl border border-sky-200 px-4 py-3 font-extrabold text-sky-700 hover:bg-sky-50">Back to my rides</Link>
              <Link href="/demo" className="rounded-xl bg-slate-900 px-4 py-3 font-extrabold text-white hover:bg-slate-800">Demo home</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
