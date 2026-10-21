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
  const [menuOpen, setMenuOpen] = useState(false);
  const [earnings, setEarnings] = useState<{ total_estimated_fare: number; this_week_estimated_fare: number; completed_rides: number } | null>(null);
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

  useEffect(() => {
    let alive = true;
    const refreshEarnings = async () => {
      try {
        const response = await fetch("/api/driver/earnings", { cache: "no-store" });
        const result = await response.json();
        if (alive && response.ok && result.summary) setEarnings(result.summary);
      } catch { /* Earnings remain unavailable until the API responds. */ }
    };
    void refreshEarnings();
    const timer = window.setInterval(() => void refreshEarnings(), 30000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

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

    <header className="absolute left-2 right-2 top-2 z-[600] flex items-start justify-between gap-2 sm:left-5 sm:right-5 sm:top-5">
      <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/80 bg-white/95 p-1.5 pr-3 shadow-xl backdrop-blur sm:gap-2 sm:p-2 sm:pr-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-lg font-black text-white sm:h-10 sm:w-10 sm:text-xl">R</div>
        <div><p className="text-sm font-black leading-5 tracking-tight sm:text-base">RideMitra</p><p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 sm:text-[11px]"><span className={"inline-block h-2 w-2 rounded-full " + (presence.is_online ? "bg-emerald-500" : "bg-slate-400")} />{presence.is_online ? "Online · accepting rides" : "Offline · not accepting rides"}</p></div>
      </div>
      <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open driver menu" aria-expanded={menuOpen} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/95 text-xl font-bold shadow-xl backdrop-blur sm:h-12 sm:w-12 sm:text-2xl">{menuOpen ? "×" : "☰"}</button>
    </header>
    {menuOpen && <nav className="absolute right-3 top-[76px] z-[700] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-5">
      <div className="border-b border-slate-100 bg-sky-50 p-4"><p className="font-black">Driver menu</p><p className="mt-1 text-xs text-slate-500">Your RideMitra account</p></div>
      {[["My rides","/driver/rides"],["Earnings","/driver/earnings"],["Ride activity","/driver/notifications"],["Vehicle & documents","/driver/onboarding"],["My profile","/driver/profile"],["Help & support","/support"]].map(([label,href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-700 last:border-0 hover:bg-sky-50">{label}<span className="float-right text-slate-400">›</span></Link>)}
    </nav>}

    <div className="absolute bottom-[76px] left-2 right-2 z-[600] pb-1 sm:bottom-5 sm:left-5 sm:right-5">
      {sheet && <section className="mb-2 max-h-[42dvh] overflow-y-auto rounded-3xl border border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:mb-3 sm:max-h-[48dvh] sm:p-4 sm:ml-auto sm:max-w-xl">
        <div className="mb-2 flex items-center justify-between sm:mb-3"><div><h2 className="text-lg font-black">{sheet === "requests" ? "Nearby ride requests" : "Your active rides"}</h2><p className="text-xs text-slate-500">{sheet === "requests" ? requests.length + " available" : active.length + " in progress"}</p></div><button onClick={() => setSheet(null)} className="rounded-full bg-slate-100 px-3 py-2 font-bold" aria-label="Close ride panel">✕</button></div>
        {sheet === "requests" && (!presence.is_online ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Go online to receive matching ride requests.</p> : requests.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{loading ? "Loading requests…" : "No matching requests yet. New requests refresh automatically."}</p> : <div className="space-y-3">{requests.map(ride => <article key={ride.id} className="rounded-2xl border border-slate-200 p-3"><div className="flex justify-between gap-3"><div><p className="text-xs font-bold text-sky-700">{Number(ride.pickup_distance_km || 0).toFixed(1)} km away · {currentVehicle}</p><h3 className="font-extrabold">{ride.passenger_name}</h3></div><b className="text-lg text-sky-700">₹{Number(ride.estimated_fare).toFixed(0)}</b></div><p className="mt-2 text-sm"><span className="font-bold">Pickup:</span> {ride.pickup}</p><p className="mt-1 text-sm"><span className="font-bold">Drop:</span> {ride.destination}</p><div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3"><button disabled={busy === ride.id} onClick={() => void act(ride, "reject")} className="rounded-xl border border-rose-200 py-3 text-sm font-bold text-rose-700">Decline</button><button disabled={busy === ride.id} onClick={() => void act(ride, "accept")} className="rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white">{busy === ride.id ? "Please wait…" : "Accept ride"}</button></div></article>)}</div>)}
        {sheet === "active" && (active.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Accepted rides will appear here.</p> : <div className="space-y-3">{active.map(ride => <article key={ride.id} className="rounded-2xl border border-slate-200 p-3"><div className="flex justify-between gap-2"><b>{ride.passenger_name}</b><span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold">{statusNames[ride.status] || ride.status}</span></div><p className="mt-2 text-sm">Pickup: {ride.pickup}</p><p className="mt-1 text-sm">Drop: {ride.destination}</p><div className="mt-3 flex flex-wrap gap-2">{ride.status === "accepted" && <button onClick={() => void act(ride, "arriving")} className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white">I'm arriving</button>}{ride.status === "arriving" && <button onClick={() => void act(ride, "start")} className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white">Start ride</button>}{ride.status === "in_progress" && <button onClick={() => void act(ride, "complete")} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Complete ride</button>}<Link href={"/ride/track?ride=" + encodeURIComponent(ride.id)} className="rounded-xl border px-3 py-2 text-sm font-bold">Passenger tracking</Link></div></article>)}</div>)}
      </section>}

      <section className="max-h-[min(48dvh,390px)] overflow-y-auto overscroll-contain rounded-[24px] border border-white/90 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,.20)] backdrop-blur-xl sm:max-h-none sm:overflow-hidden sm:rounded-[28px] sm:ml-auto sm:max-w-md">
        <div className="px-3 pb-3 pt-3 sm:px-5 sm:pb-3 sm:pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Driver mode</p><h1 className="mt-1 text-lg font-black tracking-tight sm:text-xl">{presence.is_online ? "You're ready for rides" : "Ready when you are"}</h1></div>
            <div className={"rounded-full px-3 py-1.5 text-xs font-extrabold " + (presence.is_online ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600")}>{presence.is_online ? "● ONLINE" : "○ OFFLINE"}</div>
          </div>
          <button onClick={() => void toggleOnline()} disabled={switching} className={"flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-black text-white shadow-lg transition active:scale-[0.99] disabled:opacity-60 " + (presence.is_online ? "bg-slate-900 hover:bg-slate-800" : "bg-sky-600 hover:bg-sky-700")}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-lg">{switching || locating ? "…" : presence.is_online ? "Ⅱ" : "▶"}</span>{switching ? "Please wait…" : locating ? "Finding your location…" : presence.is_online ? "Go offline" : "GO ONLINE"}
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setSheet(sheet === "requests" ? null : "requests")} className={"rounded-2xl border px-3 py-3 text-left transition " + (sheet === "requests" ? "border-sky-600 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50")}><span className="flex items-center justify-between text-sm font-extrabold">Ride requests <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800">{requests.length}</span></span><span className="mt-1 block text-xs text-slate-500">Nearby bookings</span></button>
            <button onClick={() => setSheet(sheet === "active" ? null : "active")} className={"rounded-2xl border px-3 py-3 text-left transition " + (sheet === "active" ? "border-sky-600 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50")}><span className="flex items-center justify-between text-sm font-extrabold">Active rides <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">{active.length}</span></span><span className="mt-1 block text-xs text-slate-500">Manage current trips</span></button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/driver/earnings" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:bg-sky-50">
              <span className="flex items-center justify-between text-[11px] font-bold text-slate-500"><span>RIDE EARNINGS</span><span className="text-sky-700">↗</span></span>
              <span className="mt-1 block text-lg font-black text-slate-900">{earnings ? "₹" + Math.round(earnings.total_estimated_fare).toLocaleString("en-IN") : "—"}</span>
              <span className="mt-0.5 block text-[10px] text-slate-500">{earnings ? earnings.completed_rides + " completed rides · estimates" : "Tap to view summary"}</span>
            </Link>
            <Link href="/driver/rides" className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:bg-sky-50">
              <span className="flex items-center justify-between text-[11px] font-bold text-slate-500"><span>MY RIDES</span><span className="text-sky-700">↗</span></span>
              <span className="mt-1 block text-lg font-black text-slate-900">{active.length} active</span>
              <span className="mt-0.5 block text-[10px] text-slate-500">Bookings & ride history</span>
            </Link>
          </div>
          {(message || (presence.is_online && locationStatus && !location)) && <p role="status" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{message || locationStatus}</p>}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><div><p className="text-xs font-bold text-slate-700">{currentVehicle} selected</p><p className="mt-0.5 text-[10px] text-slate-500">GPS {location ? "location available" : "not acquired yet"} · {loading ? "Syncing…" : "Auto-refresh enabled"}</p></div><Link href="/driver/onboarding" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50">Vehicle settings ›</Link></div>
          <p className="mt-2 text-[10px] leading-4 text-slate-400">Keep this page open to share GPS while online. Fare amounts are estimates; live payments are not connected.</p>
        </div>
      </section>
    </div>

    <nav aria-label="Driver app navigation" className="fixed inset-x-0 bottom-0 z-[800] border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_28px_rgba(15,23,42,.10)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
        <Link href="/driver/instant-rides" aria-current="page" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl bg-sky-50 px-1 text-sky-700"><span className="text-xl leading-5">⌂</span><span className="text-[10px] font-extrabold">Home</span></Link>
        <Link href="/driver/earnings" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-500 transition hover:bg-slate-50 hover:text-sky-700"><span className="text-xl leading-5">₹</span><span className="text-[10px] font-bold">Earnings</span></Link>
        <Link href="/driver/rides" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-500 transition hover:bg-slate-50 hover:text-sky-700"><span className="text-xl leading-5">▤</span><span className="text-[10px] font-bold">My rides</span></Link>
        <Link href="/driver/profile" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-500 transition hover:bg-slate-50 hover:text-sky-700"><span className="text-xl leading-5">●</span><span className="text-[10px] font-bold">Profile</span></Link>
      </div>
    </nav>
  </main>;
}
