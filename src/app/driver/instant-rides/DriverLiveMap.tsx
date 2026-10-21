"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./DriverLiveMap.css";

type Props = {
  location: { lat: number; lon: number } | null;
  online: boolean;
  onLocate: () => void;
  locating: boolean;
  status: string;
};

export default function DriverLiveMap({ location, online, onLocate, locating, status }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const latest = useRef(location);

  useEffect(() => { latest.current = location; }, [location]);

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    void (async () => {
      const L = await import("leaflet");
      if (disposed || !host.current || map.current) return;
      const initial = latest.current;
      const center: [number, number] = initial ? [initial.lat, initial.lon] : [17.385, 78.4867];
      const instance = L.map(host.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: true }).setView(center, initial ? 16 : 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(instance);
      L.control.zoom({ position: "topright" }).addTo(instance);
      L.control.attribution({ position: "bottomright", prefix: false }).addTo(instance);
      map.current = instance;
      observer = new ResizeObserver(() => instance.invalidateSize());
      observer.observe(host.current);
      if (initial) {
        const icon = L.divIcon({ className: "ridemitra-location-icon", html: '<span class="ridemitra-location-pulse"></span><span class="ridemitra-location-dot"></span>', iconSize: [32, 32], iconAnchor: [16, 16] });
        marker.current = L.marker([initial.lat, initial.lon], { icon, zIndexOffset: 1000 }).addTo(instance);
        marker.current.bindTooltip("You are here", { direction: "top", offset: [0, -12] });
      }
    })();
    return () => {
      disposed = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !map.current) return;
      if (!location) {
        marker.current?.remove();
        marker.current = null;
        return;
      }
      const point: [number, number] = [location.lat, location.lon];
      if (!marker.current) {
        const icon = L.divIcon({ className: "ridemitra-location-icon", html: '<span class="ridemitra-location-pulse"></span><span class="ridemitra-location-dot"></span>', iconSize: [32, 32], iconAnchor: [16, 16] });
        marker.current = L.marker(point, { icon, zIndexOffset: 1000 }).addTo(map.current);
        marker.current.bindTooltip("You are here", { direction: "top", offset: [0, -12] });
      } else marker.current.setLatLng(point);
      map.current.setView(point, Math.max(map.current.getZoom(), 16), { animate: true });
    })();
    return () => { cancelled = true; };
  }, [location]);

  return <div className="relative h-full min-h-[420px] w-full overflow-hidden bg-slate-100">
    <div ref={host} className="absolute inset-0 z-0" aria-label="Interactive driver map" />
    {!location && <div className="pointer-events-none absolute left-3 right-14 top-3 z-[500] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:left-5 sm:right-16 sm:top-5 sm:max-w-sm">
      <p className="text-sm font-extrabold text-slate-900">{online ? "Finding your GPS location…" : "Driver map"}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{online ? status : "Go online to share your live position. The map is ready when GPS permission is granted."}</p>
    </div>}
    <button type="button" onClick={onLocate} disabled={locating} className="absolute bottom-5 right-4 z-[500] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl text-slate-800 shadow-xl disabled:opacity-60" aria-label="Center map on my location" title="Center map on my location">{locating ? "…" : "⌖"}</button>
    {location && <div className="absolute left-3 top-3 z-[500] rounded-full border border-emerald-200 bg-white/95 px-3 py-2 text-xs font-bold text-emerald-800 shadow-md backdrop-blur sm:left-5 sm:top-5"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />{online ? "GPS LIVE" : "LAST KNOWN LOCATION"}</div>}
  </div>;
}
