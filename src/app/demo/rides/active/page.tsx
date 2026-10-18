"use client";

import { useState } from "react";

type TripStage = "accepted" | "arrived" | "in_progress" | "completed";

const ride = {
  id: "DM-1056",
  passenger: "Demo Rider",
  pickup: "Ameerpet Metro Station, Ameerpet, Hyderabad",
  pickupArea: "Ameerpet, Hyderabad",
  destination: "HITEC City, Mindspace, Hyderabad",
  destinationArea: "HITEC City, Hyderabad",
  fare: "₹185",
  distance: "8.2 km",
  duration: "22 min",
};

const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.pickup)}&destination=${encodeURIComponent(ride.destination)}&travelmode=driving`;

export default function ActiveDemoRidePage() {
  const [stage, setStage] = useState<TripStage>("accepted");
  const [mapsOpened, setMapsOpened] = useState(false);

  const steps: { key: TripStage; label: string }[] = [
    { key: "accepted", label: "Ride accepted" },
    { key: "arrived", label: "Arrived at pickup" },
    { key: "in_progress", label: "Trip started" },
    { key: "completed", label: "Trip completed" },
  ];
  const stageIndex = steps.findIndex((step) => step.key === stage);
  const nextAction: Record<Exclude<TripStage, "completed">, { label: string; next: TripStage }> = {
    accepted: { label: "I've arrived at pickup", next: "arrived" },
    arrived: { label: "Start trip", next: "in_progress" },
    in_progress: { label: "Complete trip", next: "completed" },
  };

  function openMaps() {
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
    setMapsOpened(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
          <span className="text-xl font-black">Ride<span className="text-sky-600">Mitra</span></span>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-800">ACTIVE RIDE</span>
        </header>

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-100 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100">Ride {ride.id}</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{stage === "completed" ? "Trip completed!" : stage === "in_progress" ? "Trip in progress" : stage === "arrived" ? "Pickup reached" : "Ride accepted!"}</h1>
          <p className="mt-2 max-w-xl text-sky-50">{stage === "completed" ? "This sample trip has been completed." : "Keep this screen open to manage the current trip. Other RideMitra pages are hidden while this ride is active."}</p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm text-sky-100">Estimated fare</p><p className="mt-1 text-4xl font-black">{ride.fare}</p></div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3"><p className="text-xs text-sky-100">Estimated trip</p><p className="mt-1 font-extrabold">{ride.distance} · {ride.duration}</p></div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Passenger details</h2>
          <div className="mt-4 flex items-center gap-4 rounded-2xl bg-sky-50 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xl font-black text-white">DR</div>
            <div className="min-w-0"><p className="text-lg font-extrabold">{ride.passenger}</p><p className="mt-1 text-sm text-slate-600">Passenger · sample profile</p></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-sky-100 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pickup area</p><p className="mt-2 font-extrabold">{ride.pickupArea}</p></div>
            <div className="rounded-xl border border-sky-100 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Destination area</p><p className="mt-2 font-extrabold">{ride.destinationArea}</p></div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Google Maps navigation</h2><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">Driving route</span></div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-5">
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pickup</p><p className="mt-1 font-extrabold">{ride.pickup}</p></div>
            <div className="my-4 ml-1.5 h-7 border-l-2 border-dashed border-slate-300" />
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 font-extrabold">{ride.destination}</p></div>
          </div>
          <button type="button" onClick={openMaps} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-4 font-extrabold text-white transition hover:bg-sky-700"><span aria-hidden="true">↗</span>{mapsOpened ? "Open Google Maps again" : "Open Google Maps navigation"}</button>
          <p className="mt-2 text-center text-xs text-slate-500">{mapsOpened ? "Maps was requested in a separate tab. Return to this RideMitra tab to update trip status." : "Google Maps opens in a separate tab so you can return here without losing the ride screen."}</p>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Trip progress</h2>
          <div className="mt-5 space-y-4">
            {steps.map((step, index) => {
              const done = index <= stageIndex;
              const current = index === stageIndex;
              return <div key={step.key} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>{done ? "✓" : index + 1}</div>
                <div className="flex-1"><p className={`font-bold ${current ? "text-sky-700" : done ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>{current && stage !== "completed" ? <p className="text-xs text-slate-500">Current stage</p> : null}</div>
                {current ? <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">NOW</span> : null}
              </div>;
            })}
          </div>
          <div className="mt-6">
            {stage !== "completed" ? <button type="button" onClick={() => setStage(nextAction[stage].next)} className="w-full rounded-xl bg-emerald-600 px-4 py-4 font-extrabold text-white transition hover:bg-emerald-700">{nextAction[stage].label} →</button> : <div className="rounded-xl bg-emerald-50 px-4 py-4 text-center font-extrabold text-emerald-800">✓ Demo ride completed</div>}
          </div>
          {stage === "completed" ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="font-extrabold text-emerald-900">Sample fare recorded: {ride.fare}</p><p className="mt-1 text-sm text-emerald-800">Demo only. No real payment or earnings record was created.</p></div> : null}
        </section>

        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-950"><strong>Demo only:</strong> Passenger name, locations, and fare are sample values. Live booking details and real navigation coordinates are not connected yet.</p>
      </div>
    </main>
  );
}
