"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Dashboard", "/demo/dashboard", "Driver workspace overview"],
  ["Instant rides", "/demo/instant-rides", "Requests and ride lifecycle"],
  ["All rides", "/demo/rides", "Upcoming and past ride examples"],
  ["Incoming request", "/demo/rides/request", "Try accept or reject"],
  ["Active ride", "/demo/active-ride", "Arrival, start and completion stages"],
  ["Ride history", "/demo/history", "Fictional completed rides"],
  ["Shared journeys", "/demo/trips", "Routes, seats and sample prices"],
  ["Documents & verification", "/demo/documents", "Onboarding checklist preview"],
  ["Earnings & payouts", "/demo/earnings", "Sample totals and activity"],
  ["Driver profile", "/demo/profile", "Sample profile details"],
  ["Notifications", "/demo/notifications", "Example driver alerts"],
  ["Help & support", "/demo/support", "Support topics preview"],
  ["Settings", "/demo/settings", "Demo preferences"],
];

export default function DemoMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  return (
    <div ref={root} className="relative z-50">
      <button
        type="button"
        aria-label="Open driver demo pages menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-white text-2xl font-black leading-none text-sky-800 shadow-sm transition hover:border-sky-400 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100"
      >
        <span aria-hidden="true">⋮</span>
      </button>
      {open && (
        <div role="menu" aria-label="Explore driver demo pages" className="absolute left-0 top-14 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-slate-300/50">
          <div className="border-b border-sky-100 bg-sky-50 px-4 py-3">
            <p className="font-black text-slate-900">Explore driver pages</p>
            <p className="mt-1 text-xs text-slate-600">Demo only · fictional data</p>
          </div>
          <nav className="max-h-[70vh] overflow-y-auto p-2">
            <Link role="menuitem" href="/demo" onClick={() => setOpen(false)} className="mb-1 block rounded-xl px-3 py-2.5 text-sm font-extrabold text-sky-800 hover:bg-sky-50">Demo overview →</Link>
            {links.map(([label, href, detail]) => (
              <Link key={href} role="menuitem" href={href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 transition hover:bg-sky-50">
                <span className="block text-sm font-bold text-slate-800">{label} <span className="text-sky-700">→</span></span>
                <span className="mt-0.5 block text-xs text-slate-500">{detail}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-100 p-2">
            <Link href="/driver/login" onClick={() => setOpen(false)} className="block rounded-xl bg-sky-600 px-3 py-2.5 text-center text-sm font-extrabold text-white hover:bg-sky-700">Driver sign in</Link>
          </div>
        </div>
      )}
    </div>
  );
}
