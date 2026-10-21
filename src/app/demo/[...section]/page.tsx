"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const pages: Record<string, { title: string; description: string; items: { title: string; detail: string; action?: string }[] }> = {
  dashboard: { title: "Driver dashboard", description: "A safe, simulated view of the driver workspace.", items: [{ title: "Availability", detail: "Switch demo availability without sharing GPS.", action: "Toggle availability" }, { title: "Verification", detail: "Review the four onboarding requirements.", action: "View checklist" }, { title: "Ride activity", detail: "Review fictional active and completed ride examples.", action: "View rides" }] },
  "instant-rides": { title: "Instant rides", description: "Preview request cards and the full ride lifecycle with fictional data.", items: [{ title: "DM-1062 · Bike", detail: "Ameerpet → Begumpet · sample fare ₹145", action: "Accept sample" }, { title: "DM-1063 · Auto", detail: "Kondapur → HITEC City · sample fare ₹210", action: "Accept sample" }, { title: "Active ride", detail: "Accepted → Arriving → In progress → Completed", action: "Advance status" }] },
  documents: { title: "Driver documents & verification", description: "Preview onboarding. Do not upload real personal documents in demo mode.", items: [{ title: "Driving licence", detail: "Demo checklist item · no file upload" }, { title: "Vehicle registration (RC)", detail: "Demo checklist item · no file upload" }, { title: "Vehicle insurance", detail: "Demo checklist item · no file upload" }, { title: "Selfie / identity check", detail: "Demo checklist item · camera is not activated" }] },
  profile: { title: "Driver profile", description: "Sample profile details only. Changes are not saved to a real account.", items: [{ title: "Demo Driver", detail: "Sample driver · Hyderabad" }, { title: "Vehicle", detail: "Choose Bike, Auto or Cab for preview", action: "Change sample vehicle" }, { title: "Account security", detail: "Real account settings remain protected by sign-in." }] },
  notifications: { title: "Notifications", description: "Example driver alerts; these are not sent to a real device.", items: [{ title: "New ride request", detail: "A fictional request is waiting in the demo." }, { title: "Verification reminder", detail: "Live drivers need genuine document review." }, { title: "Weekly summary", detail: "Sample earnings summary available." }] },
  support: { title: "Help & support", description: "Explore the support screen layout using a demo-only form.", items: [{ title: "Ride issue", detail: "Try a sample support topic." }, { title: "Account / verification", detail: "See where verification questions would appear." }, { title: "Payments", detail: "Payout processing is not enabled in this demo." }] },
  trips: { title: "Shared journeys", description: "Preview route listings and driver trip management with fictional routes.", items: [{ title: "Hyderabad → Warangal", detail: "Tomorrow · 8:30 AM · 3 seats · ₹450 per seat", action: "Select sample trip" }, { title: "Hyderabad → Vijayawada", detail: "Friday · 7:00 AM · 2 seats · ₹700 per seat", action: "Select sample trip" }] },
  settings: { title: "Settings", description: "Preview preferences locally. No real account settings are changed.", items: [{ title: "Notifications", detail: "Toggle a sample notification preference.", action: "Toggle preference" }, { title: "Language", detail: "English interface preview." }, { title: "Privacy", detail: "Demo mode does not request GPS or upload documents." }] },
  history: { title: "Ride history", description: "Review fictional past rides.", items: [{ title: "DM-1021", detail: "Jubilee Hills → Banjara Hills · completed · ₹150" }, { title: "DM-1014", detail: "Madhapur → Kondapur · completed · ₹135" }, { title: "DM-1009", detail: "Gachibowli → Financial District · completed · ₹210" }] },
};

const nav = [
  ["Overview", "/demo"], ["Dashboard", "/demo/dashboard"], ["Instant rides", "/demo/instant-rides"],
  ["All rides", "/demo/rides"], ["Incoming request", "/demo/rides/request"], ["Ride history", "/demo/history"],
  ["Shared journeys", "/demo/trips"], ["Documents", "/demo/documents"], ["Earnings", "/demo/earnings"],
  ["Profile", "/demo/profile"], ["Notifications", "/demo/notifications"], ["Support", "/demo/support"], ["Settings", "/demo/settings"],
];

export default function DemoFeaturePage() {
  const params = useParams<{ section: string[] }>();
  const section = (params.section || []).join("/") || "dashboard";
  const page = pages[section] || { title: "Driver feature preview", description: "Explore this sample driver feature without signing in.", items: [{ title: "Sample feature", detail: "All content and actions are fictional and stay in demo mode." }] };
  const [notice, setNotice] = useState("Guest demo active — no real rides, account changes, GPS, uploads, or payments.");
  const [count, setCount] = useState(0);
  return <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm">
        <Link href="/demo" className="text-2xl font-black">Ride<span className="text-sky-600">Mitra</span></Link>
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-800">GUEST DEMO · NO LOGIN</span>
      </header>
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Simulation only:</strong> This is a safe preview of the real page layout. Buttons change sample UI only. No live account, passenger, GPS, personal documents, bookings, or payouts are affected.</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[230px_1fr]">
        <aside className="h-fit rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <h2 className="px-2 pb-3 text-sm font-black uppercase tracking-wide text-slate-500">Demo navigation</h2>
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">{nav.map(([label, href]) => <Link key={href} href={href} className={"rounded-xl px-3 py-2.5 text-sm font-bold " + (href === "/demo/" + section ? "bg-sky-100 text-sky-800" : "text-slate-700 hover:bg-sky-50")}>{label} →</Link>)}</nav>
          <Link href="/driver/login" className="mt-4 block rounded-xl bg-sky-600 px-3 py-3 text-center text-sm font-extrabold text-white hover:bg-sky-700">Real driver sign in</Link>
        </aside>
        <section>
          <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 p-7 text-white shadow-lg"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-100">Driver workspace · Demo</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{page.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50">{page.description}</p><p className="mt-4 text-sm font-bold">Sample profile: Demo Driver · Hyderabad</p></div>
          <p role="status" className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-900">{notice}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{page.items.map((item, i) => <article key={item.title} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-800">Sample</span></div>{item.action && <button type="button" onClick={() => { setCount(v => v + 1); setNotice(item.action + " — demo interaction #" + (count + 1) + " only. No live data changed."); }} className="mt-4 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700">{item.action}</button>}</article>)}</div>
          <div className="mt-5 rounded-2xl border border-sky-100 bg-white p-5"><h2 className="text-lg font-black">Continue exploring</h2><p className="mt-1 text-sm text-slate-600">All available demo sections are listed in the navigation. Use the overview to return to the interactive ride lifecycle.</p><Link href="/demo" className="mt-4 inline-flex rounded-xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white">Back to demo overview →</Link></div>
        </section>
      </div>
      <footer className="py-7 text-center text-xs text-slate-500">RideMitra Guest Demo · fictional sample data · no live actions</footer>
    </div>
  </main>;
}
