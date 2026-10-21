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
        setRequests(r.requests || []);
        setActive(r.active || []);
        setMessage("");
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

      <header className="sticky top-0 z-[800] border-b border-white/10 bg-[#071827]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
          <Link href="/driver/instant-rides" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-500 text-2xl font-black text-[#062033] shadow-lg shadow-emerald-500/15">
              R
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-black tracking-tight">
                Ride<span className="text-emerald-300">Mitra</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Driver partner · Drive · Earn · Grow
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-bold text-slate-100 hover:bg-white/10 lg:hidden"
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className="fixed inset-x-3 top-[72px] z-[900] overflow-hidden rounded-2xl border border-white/10 bg-[#0b2234] shadow-2xl lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3 text-sm font-bold text-slate-200 last:border-0 hover:bg-white/5"
            >
              <span className="w-6 text-center text-emerald-300">{item.symbol}</span>
              {item.label}
              <span className="ml-auto text-slate-500">›</span>
            </Link>
          ))}
        </nav>
      )}

      <div className="relative mx-auto grid max-w-[1500px] gap-5 px-3 py-4 sm:px-6 sm:py-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-7 lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-[92px] space-y-4">
            <section className="rounded-3xl border border-white/10 bg-[#0b2234] p-3 shadow-xl shadow-black/10">
              <p className="px-3 pb-3 pt-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                Workspace
              </p>
              {navigation.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition last:mb-0 " +
                    (index === 0
                      ? "bg-emerald-300 text-[#062033] shadow-lg shadow-emerald-500/10"
                      : "text-slate-300 hover:bg-white/5 hover:text-white")
                  }
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/10 text-base">
                    {item.symbol}
                  </span>
                  <span className="min-w-0">{item.label}</span>
                </Link>
              ))}
            </section>

            <section className="overflow-hidden rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-[#0d3a3c] to-[#0b2638] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/15 text-xl text-emerald-200">
                ✦
              </div>
              <p className="mt-4 text-sm font-black">More rides. More earnings.</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Keep your status available to receive nearby requests.
              </p>
              <Link
                href="/support"
                className="mt-4 inline-flex text-xs font-extrabold text-emerald-200 hover:text-emerald-100"
              >
                Driver support <span className="ml-1">↗</span>
              </Link>
            </section>
          </div>
        </aside>

        <div className="min-w-0 space-y-5 pb-20 lg:pb-4">
          <section className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d2b40] via-[#0b2538] to-[#0b3b3a] p-5 shadow-xl shadow-black/10 sm:p-7 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-200">
                Driver dashboard
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Good to see you, Captain <span aria-hidden="true">✦</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Your rides, earnings and driver activity—all in one place.
              </p>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span
                  className={
                    "h-2 w-2 rounded-full " +
                    (presence.is_online ? "bg-emerald-300" : "bg-slate-500")
                  }
                />
                {presence.is_online
                  ? "Your profile is available for nearby ride requests."
                  : "You are offline. Go online when you're ready to ride."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void toggleOnline()}
              disabled={switching || locating}
              className={
                "flex min-h-[54px] w-full shrink-0 items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-black tracking-wide text-[#052333] shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 md:w-[220px] " +
                (presence.is_online
                  ? "bg-slate-100 text-slate-900 shadow-black/10"
                  : "bg-gradient-to-r from-emerald-300 to-emerald-400 shadow-emerald-500/15")
              }
            >
              <span className="text-lg">{switching || locating ? "…" : presence.is_online ? "Ⅱ" : "▶"}</span>
              {switching
                ? "PLEASE WAIT…"
                : locating
                  ? "FINDING LOCATION…"
                  : presence.is_online
                    ? "GO OFFLINE"
                    : "GO ONLINE"}
            </button>
          </section>

          {message && (
            <div
              role="status"
              className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100"
            >
              {message}
            </div>
          )}

          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Driver summary">
            {[
              {
                label: "Estimated total",
                value: totalEstimate,
                note: "From completed ride fares",
                symbol: "₹",
              },
              {
                label: "This week",
                value: weeklyEstimate,
                note: "Estimated ride fares",
                symbol: "↗",
              },
              {
                label: "Completed rides",
                value: earnings?.completed_rides ?? "—",
                note: "All completed rides",
                symbol: "✓",
              },
              {
                label: "Active trips",
                value: active.length,
                note: "Currently in progress",
                symbol: "⌁",
              },
            ].map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-[#0b2234] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold leading-4 text-slate-400 sm:text-xs">
                    {stat.label}
                  </p>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-sm font-black text-emerald-200">
                    {stat.symbol}
                  </span>
                </div>
                <p className="mt-3 break-words text-xl font-black tracking-tight sm:text-2xl">
                  {loading && earnings === null ? "…" : stat.value}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                  {stat.note}
                </p>
              </article>
            ))}
          </section>

          <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
            <article className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0b2234] shadow-xl shadow-black/10">
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
              <div className="h-[280px] overflow-hidden px-3 pb-3 sm:h-[340px] sm:px-4 sm:pb-4">
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

            <article className="min-w-0 rounded-3xl border border-white/10 bg-[#0b2234] p-4 shadow-xl shadow-black/10 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black sm:text-lg">New ride requests</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Requests matched to your selected vehicle
                  </p>
                </div>
                <span className="flex h-8 min-w-8 items-center justify-center rounded-xl bg-emerald-300/10 px-2 text-sm font-black text-emerald-200">
                  {requests.length}
                </span>
              </div>

              {!presence.is_online ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl text-slate-400">
                    ◷
                  </span>
                  <p className="mt-3 text-sm font-extrabold">You’re currently offline</p>
                  <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
                    Go online to receive ride requests near your location.
                  </p>
                </div>
              ) : requestCards.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-2xl text-emerald-200">
                    ⌁
                  </span>
                  <p className="mt-3 text-sm font-extrabold">
                    {loading ? "Checking for requests…" : "Waiting for your next ride"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    New matching requests refresh automatically.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {requestCards.map((ride) => (
                    <div
                      key={ride.id}
                      className="rounded-2xl border border-white/10 bg-[#102b3e] p-3 sm:p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-200">
                            {Number(ride.pickup_distance_km || 0).toFixed(1)} km away · {currentVehicle}
                          </p>
                          <p className="mt-1 truncate text-sm font-black">{ride.passenger_name || "Ride customer"}</p>
                        </div>
                        <p className="shrink-0 text-lg font-black text-emerald-200">
                          {money(Number(ride.estimated_fare || 0))}
                        </p>
                      </div>
                      <div className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
                        <p className="flex gap-2"><span className="text-emerald-300">●</span><span className="min-w-0"><b className="text-slate-100">Pickup</b> · {ride.pickup}</span></p>
                        <p className="flex gap-2"><span className="text-rose-300">●</span><span className="min-w-0"><b className="text-slate-100">Drop</b> · {ride.destination}</span></p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy === ride.id}
                          onClick={() => void act(ride, "reject")}
                          className="min-h-10 rounded-xl border border-white/10 bg-white/5 px-2 text-xs font-extrabold text-slate-300 hover:bg-white/10 disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={busy === ride.id}
                          onClick={() => void act(ride, "accept")}
                          className="min-h-10 rounded-xl bg-emerald-300 px-2 text-xs font-black text-[#062033] hover:bg-emerald-200 disabled:opacity-50"
                        >
                          {busy === ride.id ? "Please wait…" : "Accept ride"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {requests.length > 3 && (
                    <p className="text-center text-xs text-slate-400">
                      +{requests.length - 3} more requests are available.
                    </p>
                  )}
                </div>
              )}
              <div className="mt-4 border-t border-white/10 pt-4">
                <Link
                  href="/driver/notifications"
                  className="flex items-center justify-between text-xs font-extrabold text-emerald-200 hover:text-emerald-100"
                >
                  View all ride activity <span>↗</span>
                </Link>
              </div>
            </article>
          </section>

        </div>
      </div>

      <nav aria-label="Driver app navigation" className="fixed inset-x-0 bottom-0 z-[850] border-t border-white/10 bg-[#071827]/95 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {[
            { label: "Home", href: "/driver/instant-rides", symbol: "⌂" },
            { label: "Rides", href: "/driver/rides", symbol: "↗" },
            { label: "Earnings", href: "/driver/earnings", symbol: "₹" },
            { label: "Profile", href: "/driver/profile", symbol: "◉" },
            { label: "Support", href: "/support", symbol: "?" },
          ].map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={index === 0 ? "page" : undefined}
              className={
                "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 " +
                (index === 0 ? "bg-emerald-300/10 text-emerald-200" : "text-slate-500 hover:text-slate-200")
              }
            >
              <span className="text-xl leading-5">{item.symbol}</span>
              <span className="text-[10px] font-extrabold">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
