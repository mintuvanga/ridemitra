"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Ride = {
  id: string;
  pickup: string;
  destination: string;
  vehicle_type: string;
  estimated_fare: number;
  status: string;
  passenger_name: string;
  passenger_phone?: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number.isFinite(value) ? value : 0);

const stages = [
  { key: "accepted", title: "Ride accepted", detail: "Head to the passenger pickup point." },
  { key: "arriving", title: "Arrived at pickup", detail: "Confirm arrival when you reach the passenger." },
  { key: "in_progress", title: "Trip in progress", detail: "Start the trip once the passenger is onboard." },
  { key: "completed", title: "Trip completed", detail: "This trip has been completed." },
];

export default function ActiveRidePage() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("ride") || "";
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/driver/instant-rides", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load your active ride.");
      const active: Ride[] = Array.isArray(data.active) ? data.active : [];
      const selected = (requestedId && active.find((item) => item.id === requestedId)) || active[0] || null;
      setRide(selected);
      setError(selected ? "" : "No active ride was found. It may have been cancelled or completed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load your active ride.");
    } finally {
      setLoading(false);
    }
  }, [requestedId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 7000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function updateStage(action: "arriving" | "start" | "complete") {
    if (!ride || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/driver/instant-rides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: ride.id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update the ride.");
      setNotice(action === "arriving" ? "Arrival confirmed. Start the trip when the passenger is onboard."
        : action === "start" ? "Trip started. Drive safely."
        : "Trip completed successfully.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the ride.");
    } finally {
      setBusy(false);
    }
  }

  function openMaps(destination: string) {
    window.open("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(destination) + "&travelmode=driving", "_blank", "noopener,noreferrer");
  }

  const stageIndex = ride ? stages.findIndex((stage) => stage.key === ride.status) : -1;
  const nextAction = ride?.status === "accepted" ? "arriving" : ride?.status === "arriving" ? "start" : ride?.status === "in_progress" ? "complete" : null;
  const nextLabel = ride?.status === "accepted" ? "I've arrived at pickup" : ride?.status === "arriving" ? "Start trip" : ride?.status === "in_progress" ? "Complete trip" : "";

  return (
    <main className="min-h-screen bg-[#071827] px-3 pb-28 pt-4 text-[#edf7f7] sm:px-4">
      <div className="mx-auto w-full max-w-[520px]">
        <header className="flex items-center justify-between gap-3">
          <Link href="/driver/instant-rides" className="text-lg font-black">Ride<span className="text-emerald-300">Mitra</span></Link>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-extrabold text-emerald-200">Driver trip</span>
        </header>

        <section className="mt-5 overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-[#0d3a3c] via-[#0b2c3e] to-[#0b2234] p-5 sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-200">Your active ride</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{ride?.status === "in_progress" ? "Trip in progress" : ride?.status === "arriving" ? "Passenger pickup" : ride?.status === "completed" ? "Ride completed" : "Ride accepted"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Follow each step here from pickup to trip completion.</p>
          {ride && <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 p-3">
            <div><p className="text-xs text-slate-400">Estimated fare</p><p className="mt-1 text-2xl font-black text-emerald-200">{money(Number(ride.estimated_fare || 0))}</p></div>
            <span className="rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-extrabold capitalize text-emerald-200">{ride.status.replaceAll("_", " ")}</span>
          </div>}
        </section>

        {error && <p role="alert" className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm leading-6 text-rose-100">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-100">{notice}</p>}
        {loading ? <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b2234] p-6 text-sm text-slate-300">Loading ride details…</div>
          : ride ? <>
            <section className="mt-4 rounded-3xl border border-white/10 bg-[#0b2234] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-xl text-emerald-200">●</span>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Pickup location</p><p className="mt-1 break-words text-base font-bold">{ride.pickup}</p>
                  <button type="button" onClick={() => openMaps(ride.pickup)} className="mt-3 min-h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-extrabold text-emerald-200">Navigate to pickup ↗</button>
                </div>
              </div>
              <div className="ml-5 my-3 h-7 border-l-2 border-dashed border-white/15" />
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-300/10 text-xl text-rose-200">●</span>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Destination</p><p className="mt-1 break-words text-base font-bold">{ride.destination}</p>
                  {ride.status === "in_progress" && <button type="button" onClick={() => openMaps(ride.destination)} className="mt-3 min-h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-extrabold text-rose-200">Navigate to destination ↗</button>}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-[#0b2234] p-4 sm:p-5">
              <h2 className="text-base font-black">Trip progress</h2>
              <div className="mt-4 space-y-4">
                {stages.map((stage, index) => {
                  const done = stageIndex >= index;
                  const current = stageIndex === index;
                  return <div key={stage.key} className="flex gap-3">
                    <span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black " + (done ? "bg-emerald-300 text-[#062033]" : "border border-white/15 text-slate-500")}>{done ? "✓" : index + 1}</span>
                    <div className="min-w-0 flex-1 pb-1"><p className={"text-sm font-extrabold " + (current ? "text-emerald-200" : done ? "text-slate-200" : "text-slate-500")}>{stage.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{stage.detail}</p></div>
                  </div>;
                })}
              </div>
              {nextAction && <button type="button" disabled={busy} onClick={() => void updateStage(nextAction)} className="mt-5 min-h-12 w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-[#062033] transition hover:brightness-105 disabled:opacity-50">{busy ? "Updating trip…" : nextLabel}</button>}
              {ride.status === "completed" && <Link href="/driver/instant-rides" className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-[#062033]">Back to dashboard</Link>}
            </section>
          </> : <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b2234] p-5"><p className="text-sm leading-6 text-slate-300">Your active ride is not available right now.</p><Link href="/driver/new-ride-requests" className="mt-4 inline-flex rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-[#062033]">Back to new rides</Link></div>}

        <nav aria-label="Driver app navigation" className="fixed inset-x-0 bottom-0 z-[850] border-t border-white/10 bg-[#071827]/95 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur-xl">
          <div className="mx-auto grid w-full max-w-[520px] grid-cols-4 gap-1">
            <Link href="/driver/instant-rides" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400"><span className="text-xl leading-5">⌂</span><span className="text-[10px] font-extrabold">Home</span></Link>
            <Link href="/driver/new-ride-requests" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400"><span className="text-xl leading-5">＋</span><span className="text-[10px] font-extrabold">New rides</span></Link>
            <Link href="/driver/earnings" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400"><span className="text-xl leading-5">₹</span><span className="text-[10px] font-extrabold">Earnings</span></Link>
            <Link href="/driver/instant-rides" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400"><span className="text-2xl leading-5">⋯</span><span className="text-[10px] font-extrabold">More</span></Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
