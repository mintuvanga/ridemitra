"use client";

import Link from "next/link";
import { useState } from "react";

type TripStage = "accepted" | "arrived" | "in_progress" | "completed";

export default function ActiveDemoRidePage() {
  const [stage, setStage] = useState<TripStage>("accepted");
  const steps: { key: TripStage; label: string }[] = [
    { key: "accepted", label: "Ride accepted" },
    { key: "arrived", label: "Arrived at pickup" },
    { key: "in_progress", label: "Trip started" },
    { key: "completed", label: "Trip completed" },
  ];
  const stageIndex = steps.findIndex((step) => step.key === stage);
  const nextAction: Record<Exclude<TripStage, "completed">, { label: string; next: TripStage }> = {
    accepted: { label: "I’ve arrived at pickup", next: "arrived" },
    arrived: { label: "Start trip", next: "in_progress" },
    in_progress: { label: "Complete trip", next: "completed" },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
          <Link href="/demo" className="text-xl font-black">Ride<span className="text-sky-600">Mitra</span></Link>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-800">ACTIVE DEMO RIDE</span>
        </header>

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-100 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100">Ride DM-1056</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{stage === "completed" ? "Trip completed!" : stage === "in_progress" ? "Trip in progress" : stage === "arrived" ? "Pickup reached" : "Ride accepted!"}</h1>
          <p className="mt-2 max-w-xl text-sky-50">{stage === "completed" ? "You have finished this sample ride journey." : "Follow the ride stages below to test the driver workflow."}</p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm text-sky-100">Estimated fare</p><p className="mt-1 text-4xl font-black">₹185</p></div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3"><p className="text-xs text-sky-100">Estimated trip</p><p className="mt-1 font-extrabold">8.2 km · 22 min</p></div>
          </div>
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
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Route details</h2>
          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <div className="flex gap-3">
              <div className="flex w-7 shrink-0 flex-col items-center pt-1"><span className="h-3 w-3 rounded-full border-[3px] border-sky-600 bg-white" /><span className="my-1 h-12 border-l-2 border-dashed border-slate-300" /><span className="h-3 w-3 rounded-sm bg-emerald-500" /></div>
              <div className="flex-1 space-y-5"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pickup</p><p className="mt-1 font-extrabold">Ameerpet Metro Station</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 font-extrabold">HITEC City, Mindspace</p></div></div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {stage !== "completed" ? <button type="button" onClick={() => setStage(nextAction[stage].next)} className="rounded-xl bg-sky-600 px-4 py-3.5 font-extrabold text-white transition hover:bg-sky-700">{nextAction[stage].label} →</button> : <div className="rounded-xl bg-emerald-50 px-4 py-3.5 text-center font-extrabold text-emerald-800">✓ Demo ride completed</div>}
            <Link href="/demo/rides" className="rounded-xl border border-sky-200 px-4 py-3.5 text-center font-extrabold text-sky-700 hover:bg-sky-50">Back to rides</Link>
          </div>
          {stage === "completed" ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="font-extrabold text-emerald-900">Sample fare recorded: ₹185</p><p className="mt-1 text-sm text-emerald-800">This is only a local demo state. No real payment or earnings record was created.</p><Link href="/demo/earnings" className="mt-3 inline-flex font-bold text-emerald-900 underline">View demo earnings →</Link></div> : null}
        </section>

        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-950"><strong>Demo only:</strong> This sample route is illustrative. GPS navigation, live passenger updates, and real trip records are not connected.</p>
      </div>
    </main>
  );
}
