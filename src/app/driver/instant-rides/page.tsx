"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const DriverLiveMap = dynamic(() => import("./DriverLiveMap"), { ssr: false, loading: () => <div className="h-full min-h-[420px] animate-pulse bg-slate-100" /> });
type Ride = { id: string; pickup: string; destination: string; vehicle_type: string; estimated_fare: number; status: string; passenger_name: string; pickup_distance_km?: number };
type Presence = { is_online: boolean; vehicle_type: "motorcycle" | "auto" | "car"; latitude?: number | null; longitude?: number | null };
const vehicles = [{ id: "motorcycle", label: "Bike" }, { id: "auto", label: "Auto" }, { id: "car", label: "Cab" }];
const statusNames: Record<string, string> = { accepted: "Accepted", arriving: "Arriving at pickup", in_progress: "Ride in progress", completed: "Completed" };

export default function DriverInstantRidesPage() {
  const [presence, setPresence] = useState<Presence>({ is_online: false, vehicle_type: "motorcycle" });
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("Allow location access to show your live position.");
  const [locating, setLocating] = useState(false);
  const [requests, setRequests] = useState<Ride[]>([]);
  const [active, setActive] = useState<Ride[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<"requests" | "active" | null>(null);
  const [switching, setSwitching] = useState(false);
  const watchId = useRef<number | null>(null);
  const onlineRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const [presenceResponse, ridesResponse] = await Promise.all([
        fetch("/api/driver/presence", { cache: "no-store" }),
        fetch("/api/driver/instant-rides", { cache: "no-store" })
      ]);
      const p = await presenceResponse.json();
      const r = await ridesResponse.json();
      if (presenceResponse.ok && p.presence) {
        setPresence(p.presence);
        onlineRef.current = p.presence.is_online;
        if (p.presence.latitude != null && p.presence.longitude != null) {
          setLocation({ lat: Number(p.presence.latitude), lon: Number(p.presence.longitude) });
          setLocationStatus("Your latest GPS position is on the map.");
        }
      }
      if (ridesResponse.ok) {
        setRequests(r.requests || []);
        setActive(r.active || []);
      } else setMessage(r.error || "Sign in to use driver mode.");
    } catch { setMessage("Could not refresh driver details. Check your connection."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 5000); return () => window.clearInterval(timer); }, [load]);

  const stopWatching = useCallback(() => {
    if (watchId.current !== null && typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
  }, []);

  const startWatching = useCallback((vehicle: Presence["vehicle_type"]) => {
    if (!navigator.geolocation) { setLocationStatus("This browser does not support GPS location."); return; }
    stopWatching();
    setLocationStatus("Waiting for GPS signal…");
    watchId.current = navigator.geolocation.watchPosition(async pos => {
      const next = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setLocation(next);
      setLocationStatus("Live GPS position updating on the map.");
      try {
        const response = await fetch("/api/driver/presence", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_online: true, vehicle_type: vehicle, latitude: next.lat, longitude: next.lon })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not share GPS.");
        setPresence(data.presence);
      } catch (error) { setMessage(error instanceof Error ? error.message : "GPS update failed."); }
    }, error => {
      const text = error.code === 1 ? "Location permission denied. Allow location for this site in your browser settings." : error.code === 2 ? "GPS location is unavailable. Turn on device location and try again." : "GPS is taking too long. Check location settings and retry.";
      setLocationStatus(text);
      setMessage(text);
    }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 });
  }, [stopWatching]);

  useEffect(() => {
    if (presence.is_online) startWatching(presence.vehicle_type);
    else stopWatching();
    return () => stopWatching();
  }, [presence.is_online, presence.vehicle_type, startWatching, stopWatching]);

  async function toggleOnline() {
    if (switching) return;
    setSwitching(true); setMessage("");
    if (presence.is_online) {
      stopWatching();
      try {
        const response = await fetch("/api/driver/presence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_online: false, vehicle_type: presence.vehicle_type }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to go offline.");
        setPresence(data.presence); onlineRef.current = false;
        setLocationStatus("You are offline. Your last location is not live.");
        setMessage("You are now offline.");
      } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to go offline."); }
      finally { setSwitching(false); }
      return;
    }
    if (!navigator.geolocation) { setMessage("This browser does not support GPS."); setSwitching(false); return; }
    setLocating(true); setLocationStatus("Getting your GPS location before going online…");
    navigator.geolocation.getCurrentPosition(async pos => {
      const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      try {
        const response = await fetch("/api/driver/presence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_online: true, vehicle_type: presence.vehicle_type, latitude: coords.lat, longitude: coords.lon }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to go online.");
        setLocation(coords); setPresence(data.presence); onlineRef.current = true;
        setLocationStatus("Live GPS active. Your map will follow your position.");
        setMessage("You're online. Your live map is ready.");
        startWatching(presence.vehicle_type);
      } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to go online."); setLocationStatus("Could not start GPS sharing."); }
      finally { setLocating(false); setSwitching(false); }
    }, error => {
      const text = error.code === 1 ? "Location permission denied. Allow location for this website, then try again." : "Could not get GPS. Turn on device location and retry.";
      setMessage(text); setLocationStatus(text); setLocating(false); setSwitching(false);
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 });
  }

  async function act(ride: Ride, action: string) {
    setBusy(ride.id); setMessage("");
    try {
      const response = await fetch("/api/driver/instant-rides", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ride_id: ride.id, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update ride.");
      setMessage("Ride updated: " + (statusNames[data.ride?.status] || data.ride?.status || "success"));
      await load();
      if (["accept", "arriving", "start"].includes(action)) {
        const destination = action === "start" ? ride.destination : ride.pickup;
        window.open("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(destination) + "&travelmode=driving", "_blank", "noopener,noreferrer");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update ride."); }
    finally { setBusy(""); }
  }

  const currentVehicle = vehicles.find(v => v.id === presence.vehicle_type)?.label || "Driver";
  return <main className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden bg-slate-100 text-slate-900">
    <div className="absolute inset-0"><DriverLiveMap location={location} online={presence.is_online} onLocate={() => {
      if (!navigator.geolocation) { setMessage("GPS is not supported by this browser."); return; }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(pos => { const next = { lat: pos.coords.latitude, lon: pos.coords.longitude }; setLocation(next); setLocationStatus("Map centered on your current location."); setLocating(false); }, err => { setLocationStatus(err.code === 1 ? "Location permission denied. Allow location for this website." : "Unable to get GPS location."); setLocating(false); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 });
    }} locating={locating} status={locationStatus} /></div>

    <header className="absolute left-3 right-3 top-3 z-[600] flex items-center justify-between gap-2 sm:left-5 sm:right-5 sm:top-5">
      <Link href="/" className="rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-lg font-black shadow-lg backdrop-blur">Ride<span className="text-sky-600">Mitra</span></Link>
      <div className="flex gap-2"><Link href="/driver/notifications" className="rounded-2xl border border-white/70 bg-white/95 px-3 py-3 text-sm font-bold shadow-lg backdrop-blur">Activity</Link><Link href="/driver/onboarding" className="rounded-2xl border border-white/70 bg-white/95 px-3 py-3 text-sm font-bold shadow-lg backdrop-blur">Vehicle</Link></div>
    </header>

    <div className="absolute bottom-3 left-3 right-3 z-[600] sm:bottom-5 sm:left-5 sm:right-5">
      {sheet && <section className="mb-3 max-h-[48dvh] overflow-y-auto rounded-3xl border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:ml-auto sm:max-w-xl">
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-black">{sheet === "requests" ? "Nearby ride requests" : "Your active rides"}</h2><p className="text-xs text-slate-500">{sheet === "requests" ? requests.length + " available" : active.length + " in progress"}</p></div><button onClick={() => setSheet(null)} className="rounded-full bg-slate-100 px-3 py-2 font-bold" aria-label="Close ride panel">✕</button></div>
        {sheet === "requests" && (!presence.is_online ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Go online to receive matching ride requests.</p> : requests.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{loading ? "Loading requests…" : "No matching requests yet. New requests refresh automatically."}</p> : <div className="space-y-3">{requests.map(ride => <article key={ride.id} className="rounded-2xl border border-slate-200 p-3"><div className="flex justify-between gap-3"><div><p className="text-xs font-bold text-sky-700">{Number(ride.pickup_distance_km || 0).toFixed(1)} km away · {currentVehicle}</p><h3 className="font-extrabold">{ride.passenger_name}</h3></div><b className="text-lg text-sky-700">₹{Number(ride.estimated_fare).toFixed(0)}</b></div><p className="mt-2 text-sm"><span className="font-bold">Pickup:</span> {ride.pickup}</p><p className="mt-1 text-sm"><span className="font-bold">Drop:</span> {ride.destination}</p><div className="mt-3 grid grid-cols-2 gap-2"><button disabled={busy === ride.id} onClick={() => void act(ride, "reject")} className="rounded-xl border border-rose-200 py-3 text-sm font-bold text-rose-700">Decline</button><button disabled={busy === ride.id} onClick={() => void act(ride, "accept")} className="rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white">{busy === ride.id ? "Please wait…" : "Accept ride"}</button></div></article>)}</div>)}
        {sheet === "active" && (active.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Accepted rides will appear here.</p> : <div className="space-y-3">{active.map(ride => <article key={ride.id} className="rounded-2xl border border-slate-200 p-3"><div className="flex justify-between gap-2"><b>{ride.passenger_name}</b><span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold">{statusNames[ride.status] || ride.status}</span></div><p className="mt-2 text-sm">Pickup: {ride.pickup}</p><p className="mt-1 text-sm">Drop: {ride.destination}</p><div className="mt-3 flex flex-wrap gap-2">{ride.status === "accepted" && <button onClick={() => void act(ride, "arriving")} className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white">I'm arriving</button>}{ride.status === "arriving" && <button onClick={() => void act(ride, "start")} className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white">Start ride</button>}{ride.status === "in_progress" && <button onClick={() => void act(ride, "complete")} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Complete ride</button>}<Link href={"/ride/track?ride=" + encodeURIComponent(ride.id)} className="rounded-xl border px-3 py-2 text-sm font-bold">Passenger tracking</Link></div></article>)}</div>)}
      </section>}

      <section className="rounded-3xl border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:ml-auto sm:max-w-xl sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><div className="flex items-center gap-2"><span className={"h-2.5 w-2.5 rounded-full " + (presence.is_online ? "animate-pulse bg-emerald-500" : "bg-slate-400")} /><h1 className="truncate text-lg font-black">{presence.is_online ? "You're online" : "You're offline"}</h1></div><p className="mt-1 truncate text-xs text-slate-500">{presence.is_online ? "Finding rides near you · " + currentVehicle : "Go online to start receiving nearby rides"}</p></div>
          <button onClick={() => void toggleOnline()} disabled={switching} className={"shrink-0 rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-md disabled:opacity-60 " + (presence.is_online ? "bg-slate-800" : "bg-emerald-600")}>{switching ? "Please wait…" : locating ? "Finding GPS…" : presence.is_online ? "Go offline" : "Go online"}</button>
        </div>
        <div className="mt-3 flex gap-2"><button onClick={() => setSheet(sheet === "requests" ? null : "requests")} className={"flex-1 rounded-xl px-3 py-3 text-sm font-extrabold " + (sheet === "requests" ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-800")}>Ride requests <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-xs">{requests.length}</span></button><button onClick={() => setSheet(sheet === "active" ? null : "active")} className={"flex-1 rounded-xl px-3 py-3 text-sm font-extrabold " + (sheet === "active" ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-800")}>Active rides <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-xs">{active.length}</span></button></div>
        {(message || (presence.is_online && locationStatus && !location)) && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{message || locationStatus}</p>}
        <p className="mt-2 text-[10px] leading-4 text-slate-500">GPS sharing works while this page stays open and location permission is enabled. Fares are estimates; payments are not connected.</p>
      </section>
    </div>
  </main>;
}
