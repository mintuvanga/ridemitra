"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const DriverLiveMap = dynamic(() => import("./DriverLiveMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[280px] animate-pulse rounded-2xl bg-[#102b3e]" />,
});

type Ride = {
  id: string;
  pickup: string;
  destination: string;
  vehicle_type: string;
  estimated_fare: number;
  status: string;
  passenger_name: string;
  pickup_distance_km?: number;
};
type Presence = {
  is_online: boolean;
  vehicle_type: "motorcycle" | "auto" | "car";
  latitude?: number | null;
  longitude?: number | null;
};

const vehicles = [
  { id: "motorcycle", label: "Bike" },
  { id: "auto", label: "Auto" },
  { id: "car", label: "Cab" },
];
const statusNames: Record<string, string> = {
  accepted: "Accepted",
  arriving: "Arriving at pickup",
  in_progress: "Ride in progress",
  completed: "Completed",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export default function DriverInstantRidesPage() {
  const [presence, setPresence] = useState<Presence>({
    is_online: false,
    vehicle_type: "motorcycle",
  });
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState(
    "Allow location access to show your live position.",
  );
  const [locating, setLocating] = useState(false);
  const [requests, setRequests] = useState<Ride[]>([]);
  const [active, setActive] = useState<Ride[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [earnings, setEarnings] = useState<{
    total_estimated_fare: number;
    this_week_estimated_fare: number;
    completed_rides: number;
  } | null>(null);
  const watchId = useRef<number | null>(null);
  const previousRequestIds = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    try {
      const [presenceResponse, ridesResponse] = await Promise.all([
        fetch("/api/driver/presence", { cache: "no-store" }),
        fetch("/api/driver/instant-rides", { cache: "no-store" }),
      ]);
      const p = await presenceResponse.json();
      const r = await ridesResponse.json();
      if (presenceResponse.ok && p.presence) {
        setPresence(p.presence);
        if (p.presence.latitude != null && p.presence.longitude != null) {
          setLocation({
            lat: Number(p.presence.latitude),
            lon: Number(p.presence.longitude),
          });
          setLocationStatus("Your latest GPS position is on the map.");
        }
      }
      if (ridesResponse.ok) {
        const nextRequests: Ride[] = Array.isArray(r.requests) ? r.requests : [];
        const nextIds = new Set(nextRequests.map((ride) => ride.id));
        const previousIds = previousRequestIds.current;
        previousRequestIds.current = nextIds;
        setRequests(nextRequests);
        setActive(r.active || []);
        setMessage("");
        if (previousIds && nextRequests.some((ride) => !previousIds.has(ride.id))) {
          window.location.assign("/driver/new-ride-requests");
          return;
        }
      } else {
        setMessage(r.error || "Sign in to use driver mode.");
      }
    } catch {
      setMessage("Could not refresh driver details. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    let alive = true;
    const refreshEarnings = async () => {
      try {
        const response = await fetch("/api/driver/earnings", { cache: "no-store" });
        const result = await response.json();
        if (alive && response.ok && result.summary) setEarnings(result.summary);
      } catch {
        // Keep the summary in an unavailable state until the API responds.
      }
    };
    void refreshEarnings();
    const timer = window.setInterval(() => void refreshEarnings(), 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const stopWatching = useCallback(() => {
    if (
      watchId.current !== null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
  }, []);

  const startWatching = useCallback(
    (vehicle: Presence["vehicle_type"]) => {
      if (!navigator.geolocation) {
        setLocationStatus("This browser does not support GPS location.");
        return;
      }
      stopWatching();
      setLocationStatus("Waiting for GPS signal…");
      watchId.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const next = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setLocation(next);
          setLocationStatus("Live GPS position updating on the map.");
          try {
            const response = await fetch("/api/driver/presence", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                is_online: true,
                vehicle_type: vehicle,
                latitude: next.lat,
                longitude: next.lon,
              }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Could not share GPS.");
            setPresence(data.presence);
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "GPS update failed.");
          }
        },
        (error) => {
          const text =
            error.code === 1
              ? "Location permission denied. Allow location for this site in browser settings."
              : error.code === 2
                ? "GPS location is unavailable. Turn on device location and try again."
                : "GPS is taking too long. Check location settings and retry.";
          setLocationStatus(text);
          setMessage(text);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 },
      );
    },
    [stopWatching],
  );

  useEffect(() => {
    if (presence.is_online) startWatching(presence.vehicle_type);
    else stopWatching();
    return () => stopWatching();
  }, [presence.is_online, presence.vehicle_type, startWatching, stopWatching]);

  async function toggleOnline() {
    if (switching) return;
    setSwitching(true);
    setMessage("");

    if (presence.is_online) {
      stopWatching();
      try {
        const response = await fetch("/api/driver/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_online: false,
            vehicle_type: presence.vehicle_type,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to go offline.");
        setPresence(data.presence);
        setLocationStatus("You are offline. Your last location is not live.");
        setMessage("You are now offline.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to go offline.");
      } finally {
        setSwitching(false);
      }
      return;
    }

    if (!navigator.geolocation) {
      setMessage("This browser does not support GPS.");
      setSwitching(false);
      return;
    }
    setLocating(true);
    setLocationStatus("Getting your GPS location before going online…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        try {
          const response = await fetch("/api/driver/presence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              is_online: true,
              vehicle_type: presence.vehicle_type,
              latitude: coords.lat,
              longitude: coords.lon,
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to go online.");
          setLocation(coords);
          setPresence(data.presence);
          setLocationStatus("Live GPS active. Your map will follow your position.");
          setMessage("You're online. You're ready to receive nearby trips.");
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Unable to go online.");
          setLocationStatus("Could not start GPS sharing.");
        } finally {
          setLocating(false);
          setSwitching(false);
        }
      },
      (error) => {
        const text =
          error.code === 1
            ? "Location permission denied. Allow location for this website, then try again."
            : "Could not get GPS. Turn on device location and retry.";
        setMessage(text);
        setLocationStatus(text);
        setLocating(false);
        setSwitching(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 },
    );
  }

  async function act(ride: Ride, action: string) {
    setBusy(ride.id);
    setMessage("");
    try {
      const response = await fetch("/api/driver/instant-rides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: ride.id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update ride.");
      setMessage(
        "Ride updated: " +
          (statusNames[data.ride?.status] || data.ride?.status || "success"),
      );
      await load();
      if (["accept", "arriving", "start"].includes(action)) {
        const destination = action === "start" ? ride.destination : ride.pickup;
        window.open(
          "https://www.google.com/maps/dir/?api=1&destination=" +
            encodeURIComponent(destination) +
            "&travelmode=driving",
          "_blank",
          "noopener,noreferrer",
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update ride.");
    } finally {
      setBusy("");
    }
  }

  function centerOnLocation() {
    if (!navigator.geolocation) {
      setMessage("GPS is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationStatus("Map centered on your current location.");
        setLocating(false);
      },
      (error) => {
        setLocationStatus(
          error.code === 1
            ? "Location permission denied. Allow location for this website."
            : "Unable to get GPS location.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 },
    );
  }

  const currentVehicle =
    vehicles.find((vehicle) => vehicle.id === presence.vehicle_type)?.label || "Driver";
  const totalEstimate =
    earnings == null ? "—" : money(Math.round(earnings.total_estimated_fare));
  const weeklyEstimate =
    earnings == null ? "—" : money(Math.round(earnings.this_week_estimated_fare));

  const navigation = [
    { label: "Home", href: "/driver/instant-rides", symbol: "⌂" },
    { label: "My rides", href: "/driver/rides", symbol: "↗" },
    { label: "Earnings", href: "/driver/earnings", symbol: "₹" },
    { label: "Ride activity", href: "/driver/notifications", symbol: "◷" },
    { label: "Profile", href: "/driver/profile", symbol: "◉" },
    { label: "Vehicle & documents", href: "/driver/onboarding", symbol: "▣" },
    { label: "Help & support", href: "/support", symbol: "?" },
  ];

  const requestCards = requests.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#071827] text-[#edf7f7]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-36 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[110px]" />
        <div className="absolute -bottom-48 left-1/4 h-[400px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-[800] border-b border-white/10 bg-[#071827]/95 px-3 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[520px] items-center justify-between gap-3">
          <Link href="/driver/instant-rides" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-500 text-xl font-black text-[#062033] shadow-lg shadow-emerald-500/15">
              R
            </span>
            <span className="min-w-0">
              <span className="block text-base font-black tracking-tight">
                Ride<span className="text-emerald-300">Mitra</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Driver partner · Drive · Earn · Grow
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={
                  "hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold sm:flex " +
                  (presence.is_online
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/5 text-slate-300")
                }
              >
                <span
                  className={
                    "h-2 w-2 rounded-full " +
                    (presence.is_online ? "animate-pulse bg-emerald-300" : "bg-slate-500")
                  }
                />
                {presence.is_online ? "You are online" : "You are offline"}
              </span>
              <button
                type="button"
                onClick={() => void toggleOnline()}
                disabled={switching || locating}
                className={
                  "min-h-10 rounded-xl px-3 py-2 text-[10px] font-black tracking-wide text-[#052333] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-xs " +
                  (presence.is_online
                    ? "bg-slate-100 text-slate-900"
                    : "bg-gradient-to-r from-emerald-300 to-emerald-400")
                }
              >
                {switching ? "PLEASE WAIT…" : locating ? "LOCATING…" : presence.is_online ? "GO OFFLINE" : "GO ONLINE"}
              </button>
            </div>
            <Link
              href="/driver/notifications"
              aria-label="Ride notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-100 transition hover:bg-white/10"
            >
              ♧
              {requests.length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-300 ring-2 ring-[#071827]" />
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open driver menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-bold text-slate-100 hover:bg-white/10"
            >
              {menuOpen ? "×" : "⋯"}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[890] bg-black/55 backdrop-blur-[2px]" />
          <nav aria-label="More driver options" className="fixed right-3 top-[72px] z-[900] w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-white/10 bg-[#0b2234] p-3 shadow-2xl shadow-black/40">
            <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/10 text-lg text-emerald-200">{item.symbol}</span>
                <span>{item.label}</span><span className="ml-auto text-slate-500">›</span>
              </Link>
            ))}
            <div className="mt-2 rounded-2xl border border-emerald-300/15 bg-gradient-to-br from-[#0d3a3c] to-[#0b2638] p-4">
              <p className="text-sm font-black">More rides. More earnings.</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Keep your status available to receive nearby requests.</p>
              <Link href="/support" onClick={() => setMenuOpen(false)} className="mt-3 inline-flex text-xs font-extrabold text-emerald-200">Driver support ↗</Link>
            </div>
          </nav>
        </>
      )}

      <div className="relative mx-auto grid w-full max-w-[520px] gap-5 px-3 py-4 sm:px-4 sm:py-5">
        <div className="min-w-0 space-y-4 pb-24">

          {message && (
            <div
              role="status"
              className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100"
            >
              {message}
            </div>
          )}

          <section aria-label="Driver summary" className="rounded-2xl border border-white/10 bg-[#0b2234] px-3 py-3 shadow-lg shadow-black/5 sm:px-4">
            <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
              {[
                { label: "Estimated total", value: totalEstimate, note: "Completed fares" },
                { label: "This week", value: weeklyEstimate, note: "Estimated fares" },
                { label: "Completed rides", value: earnings?.completed_rides ?? "—", note: "All-time" },
                { label: "Active trips", value: active.length, note: "In progress" },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0 px-3 py-2 sm:px-4 sm:py-1">
                  <p className="truncate text-[10px] font-bold text-slate-400 sm:text-xs">{stat.label}</p>
                  <p className="mt-1 truncate text-lg font-black tracking-tight text-slate-100 sm:text-xl">
                    {loading && earnings === null ? "…" : stat.value}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">{stat.note}</p>
                </div>
              ))}
            </div>
          </section>


          <section className="grid min-w-0 grid-cols-1 gap-5">
            <article id="driver-map" className="min-w-0 scroll-mt-20 overflow-hidden rounded-3xl border border-white/10 bg-[#0b2234] shadow-xl shadow-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-5 sm:px-5">
                <div>
                  <h2 className="text-base font-black sm:text-lg">Live driver map</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {location ? "Your current GPS position" : "Map preview · Hyderabad"}
                  </p>
                </div>
                <span
                  className={
                    "rounded-full border px-3 py-1.5 text-[10px] font-extrabold " +
                    (presence.is_online
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                      : "border-white/10 bg-white/5 text-slate-400")
                  }
                >
                  {presence.is_online ? "● GPS LIVE" : "○ OFFLINE"}
                </span>
              </div>
              <div className="h-[420px] overflow-hidden px-3 pb-3 sm:h-[520px] sm:px-4 sm:pb-4">
                <div className="h-full overflow-hidden rounded-2xl border border-white/10">
                  <DriverLiveMap
                    location={location}
                    online={presence.is_online}
                    onLocate={centerOnLocation}
                    locating={locating}
                    status={locationStatus}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 sm:px-5">
                <p className="min-w-0 text-xs leading-5 text-slate-400">
                  {locationStatus}
                </p>
                <button
                  type="button"
                  onClick={centerOnLocation}
                  disabled={locating}
                  className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 disabled:opacity-50"
                >
                  {locating ? "Locating…" : "Center map"}
                </button>
              </div>
            </article>

          </section>

        </div>
      </div>

      <nav aria-label="Driver app navigation" className="fixed inset-x-0 bottom-0 z-[850] border-t border-white/10 bg-[#071827]/95 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-[520px] grid-cols-6 gap-1">
          <Link href="/driver/instant-rides" aria-current="page" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl bg-emerald-300/10 px-1 text-emerald-200">
            <span className="text-xl leading-5">⌂</span><span className="text-[10px] font-extrabold">Home</span>
          </Link>
          <Link href="/driver/rides" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-slate-100">
            <span className="text-xl leading-5">↗</span><span className="text-[10px] font-extrabold">My rides</span>
          </Link>
          <Link href="#driver-map" onClick={(event) => { event.preventDefault(); document.getElementById("driver-map")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-label="Maps" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-emerald-200">
            <span className="text-xl leading-5">⌖</span><span className="text-[10px] font-extrabold">Maps</span>
          </Link>
          <Link href="/driver/new-ride-requests" aria-label="New ride requests" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-emerald-200">
            <span className="text-xl leading-5">＋</span><span className="text-[10px] font-extrabold">New rides</span>
          </Link>
          <Link href="/driver/earnings" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-slate-100">
            <span className="text-xl leading-5">₹</span><span className="text-[10px] font-extrabold">Earnings</span>
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="More options" aria-expanded={menuOpen} className={"flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 transition " + (menuOpen ? "bg-white/10 text-emerald-200" : "text-slate-400 hover:text-slate-100")}>
            <span className="text-2xl leading-5">⋯</span><span className="text-[10px] font-extrabold">More</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
