"use client";

import Link from "next/link";
import { useState } from "react";
import DemoMenu from "@/components/demo/DemoMenu";

type DemoStatus = "Requested" | "Accepted" | "Arriving" | "In progress" | "Completed" | "Rejected";
type DemoRide = { id: string; passenger: string; route: string; vehicle: string; fare: number; status: DemoStatus };
const startingRides: DemoRide[] = [
  { id: "DM-1042", passenger: "Ananya R.", route: "Madhapur → Gachibowli", vehicle: "Bike", fare: 180, status: "Requested" },
  { id: "DM-1038", passenger: "Rahul K.", route: "Kondapur → HITEC City", vehicle: "Auto", fare: 125, status: "Requested" },
  { id: "DM-1021", passenger: "Priya S.", route: "Jubilee Hills → Banjara Hills", vehicle: "Cab", fare: 150, status: "Accepted" },
];
const cash = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function DemoDriverPage() {
  const [rides, setRides] = useState(startingRides);
  const [online, setOnline] = useState(false);
  const [vehicle, setVehicle] = useState("Bike");
  const [message, setMessage] = useState("Guest mode is active. All records and actions on this page are simulated.");
  const completed = rides.filter((r) => r.status === "Completed");
  const earnings = completed.reduce((sum, ride) => sum + ride.fare, 0);

  function updateRide(id: string, status: DemoStatus) {
    setRides((old) => old.map((ride) => ride.id === id ? { ...ride, status } : ride));
    setMessage("Demo ride updated to " + status + ". This did not affect any real passenger or booking.");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
          <div className="flex items-center gap-3"><DemoMenu /><Link href="/" className="text-2xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span></Link></div>
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-800">GUEST DEMO · NO LOGIN</span><Link href="/driver/login" className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700">Driver sign in</Link></div>
        </header>

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 p-6 text-white shadow-xl shadow-sky-200 sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-100">Explore before signing in</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Welcome to RideMitra Guest Demo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">Preview driver availability, incoming rides, ride status changes, shared journeys, document verification, and earnings without creating an account.</p>
          <div className="mt-5 inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold">Sample profile: Demo Driver · Hyderabad</div>
        </section>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Demo-only notice:</strong> All names, trips, seats and fares are fictional. Buttons below update sample data only. No GPS is collected, no documents are uploaded, and no real rides, payments or payouts are created.</div>
        {message && <p role="status" className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-900">{message}</p>}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Driver status", value: online ? "Online · Demo" : "Offline" },
            { label: "Incoming requests", value: String(rides.filter(r => r.status === "Requested").length) },
            { label: "Completed rides", value: String(completed.length) },
            { label: "Sample fare total", value: cash(earnings) },
          ].map((card) => <article key={card.label} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{card.label}</p><p className="mt-2 text-2xl font-black">{card.value}</p><p className="mt-1 text-xs text-slate-500">Illustrative demo data</p></article>)}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-black">Driver mode preview</h2><p className="mt-1 text-sm text-slate-500">Try the availability controls safely.</p>
            <label className="mt-5 block text-sm font-bold">Vehicle type<select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>Bike</option><option>Auto</option><option>Cab</option></select></label>
            <button type="button" onClick={() => { setOnline((old) => !old); setMessage(online ? "Demo driver is now offline." : "Demo driver is now online. No GPS or live dispatch is involved."); }} className={"mt-4 w-full rounded-xl px-4 py-3 font-extrabold text-white " + (online ? "bg-slate-700" : "bg-emerald-600")}>{online ? "Go offline · Demo" : "Go online · Demo"}</button>
            <div className="mt-5 space-y-2"><Link href="/demo/rides" className="flex items-center justify-between rounded-xl border border-sky-100 p-3 text-sm font-bold hover:bg-sky-50"><span>All demo rides</span><span className="text-sky-700">Open →</span></Link><Link href="/demo/rides/request" className="flex items-center justify-between rounded-xl border border-sky-100 p-3 text-sm font-bold hover:bg-sky-50"><span>Incoming ride screen</span><span className="text-sky-700">Try →</span></Link><Link href="/demo/earnings" className="flex items-center justify-between rounded-xl border border-sky-100 p-3 text-sm font-bold hover:bg-sky-50"><span>Earnings & payout preview</span><span className="text-sky-700">Open →</span></Link></div>
          </article>

          <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Interactive ride lifecycle</h2><p className="mt-1 text-sm text-slate-500">Try accept → arriving → start → complete.</p></div><button type="button" onClick={() => { setRides(startingRides); setMessage("Demo rides reset to their starting sample statuses."); }} className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700">Reset</button></div>
            <div className="mt-4 space-y-3">{rides.map((ride) => <div key={ride.id} className="rounded-xl border border-sky-100 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-extrabold text-sky-700">{ride.id} · {ride.vehicle}</p><h3 className="mt-1 font-extrabold">{ride.passenger}</h3><p className="mt-1 text-sm text-slate-600">{ride.route}</p></div><div className="text-right"><p className="font-black">{cash(ride.fare)}</p><span className="text-xs text-slate-500">Sample fare</span></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className={"rounded-full px-3 py-1 text-xs font-extrabold " + (ride.status === "Completed" ? "bg-emerald-100 text-emerald-800" : ride.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-sky-100 text-sky-800")}>{ride.status}</span><div className="flex flex-wrap gap-2">{ride.status === "Requested" && <><button type="button" onClick={() => updateRide(ride.id, "Rejected")} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Reject</button><button type="button" onClick={() => updateRide(ride.id, "Accepted")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Accept</button></>}{ride.status === "Accepted" && <button type="button" onClick={() => updateRide(ride.id, "Arriving")} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white">Arriving</button>}{ride.status === "Arriving" && <button type="button" onClick={() => updateRide(ride.id, "In progress")} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white">Start ride</button>}{ride.status === "In progress" && <button type="button" onClick={() => updateRide(ride.id, "Completed")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Complete</button>}</div></div></div>)}</div>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Shared journeys</h2><p className="mt-2 text-sm leading-6 text-slate-600">Preview sample route listings, departure times, seat counts and per-seat prices.</p><div className="mt-4 space-y-3"><div className="rounded-xl bg-sky-50 p-4"><p className="font-extrabold">Hyderabad → Warangal</p><p className="mt-1 text-sm text-slate-600">Tomorrow · 8:30 AM · 3 seats · ₹450 / seat</p></div><div className="rounded-xl bg-sky-50 p-4"><p className="font-extrabold">Hyderabad → Vijayawada</p><p className="mt-1 text-sm text-slate-600">Friday · 7:00 AM · 2 seats · ₹700 / seat</p></div></div><Link href="/trips" className="mt-4 inline-flex text-sm font-bold text-sky-700 underline">Open live journeys page (login may be required) →</Link></article>
          <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Driver verification checklist</h2><p className="mt-2 text-sm leading-6 text-slate-600">Preview the onboarding requirements without uploading personal files.</p><div className="mt-4 space-y-3">{["Driving licence", "Vehicle registration (RC)", "Vehicle insurance", "Selfie & identity check"].map((name) => <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><span className="text-sm font-bold">{name}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-800">Demo only</span></div>)}</div><p className="mt-4 text-xs leading-5 text-amber-800">Live driver acceptance still requires genuine verification approval.</p></article>
        </section>
        <section className="mt-5 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black">Explore every driver page</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use these demo-only pages to preview the driver workspace without signing in. Actions use fictional data and do not affect a real account.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Dashboard", "/demo/dashboard", "Driver workspace overview"],
              ["Instant rides", "/demo/instant-rides", "Requests and ride lifecycle"],
              ["All rides", "/demo/rides", "Upcoming and past ride examples"],
              ["Incoming request", "/demo/rides/request", "Try accept or reject"],
              ["Ride history", "/demo/history", "Fictional completed rides"],
              ["Shared journeys", "/demo/trips", "Routes, seats and sample prices"],
              ["Documents & verification", "/demo/documents", "Onboarding checklist preview"],
              ["Earnings & payouts", "/demo/earnings", "Sample totals and activity"],
              ["Driver profile", "/demo/profile", "Sample profile details"],
              ["Notifications", "/demo/notifications", "Example driver alerts"],
              ["Help & support", "/demo/support", "Support topics preview"],
              ["Settings", "/demo/settings", "Demo preferences"],
            ].map(([label, href, detail]) => <Link key={href} href={href} className="rounded-xl border border-sky-100 p-4 transition hover:border-sky-300 hover:bg-sky-50"><span className="block font-extrabold">{label} <span className="text-sky-700">→</span></span><span className="mt-1 block text-sm text-slate-500">{detail}</span></Link>)}
          </div>
        </section>
        <footer className="py-7 text-center text-xs leading-5 text-slate-500">RideMitra Guest Demo · Sample data only · <Link href="/driver/login" className="font-bold text-sky-700 underline">Sign in to your private account</Link></footer>
      </div>
    </main>
  );
}
