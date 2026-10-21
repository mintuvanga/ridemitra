"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import DemoMenu from "@/components/demo/DemoMenu";

const cash = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

type RequestStatus = "Waiting" | "Accepted" | "Rejected";
const sampleRequests = [
  { id: "RM-2042", passenger: "Ananya R.", pickup: "Madhapur, Hyderabad", drop: "Gachibowli, Hyderabad", distance: "Pickup 1.2 km · Trip 6.4 km", fare: 180, vehicle: "Bike" },
  { id: "RM-2043", passenger: "Rahul K.", pickup: "Kondapur, Hyderabad", drop: "HITEC City, Hyderabad", distance: "Pickup 0.8 km · Trip 4.1 km", fare: 125, vehicle: "Auto" },
];

const nav = [
  ["Home", "/demo"], ["Dashboard", "/demo/dashboard"], ["Instant rides", "/demo/instant-rides"],
  ["All rides", "/demo/rides"], ["Incoming request", "/demo/rides/request"], ["Active ride", "/demo/active-ride"],
  ["Ride history", "/demo/history"], ["Shared journeys", "/demo/trips"], ["Documents & verification", "/demo/documents"],
  ["Earnings & payouts", "/demo/earnings"], ["Driver profile", "/demo/profile"], ["Notifications", "/demo/notifications"],
  ["Help & support", "/demo/support"], ["Settings", "/demo/settings"],
];

const contentPages: Record<string, { title: string; description: string }> = {
  dashboard: { title: "Driver dashboard", description: "Your daily driver overview and shortcuts." },
  rides: { title: "All rides", description: "Review separate sample cards for incoming, active and completed trips." },
  history: { title: "Ride history", description: "A list of fictional completed rides." },
  trips: { title: "Shared journeys", description: "Preview sample routes, departure times, seat counts and per-seat prices." },
  documents: { title: "Documents & verification", description: "Preview the onboarding checklist. This demo does not upload files or verify identity." },
  earnings: { title: "Earnings & payouts", description: "Illustrative sample totals only. Real payouts are not available in this demo." },
  profile: { title: "Driver profile", description: "Edit sample display preferences locally; nothing is saved to a real driver account." },
  notifications: { title: "Notifications", description: "Example alerts for the driver workspace." },
  support: { title: "Help & support", description: "Choose a demo support topic to preview the support flow." },
  settings: { title: "Settings", description: "Preview preferences for the demo only." },
};

export default function DemoFeaturePage() {
  const params = useParams<{ section: string[] }>();
  const section = (params.section || []).join("/") || "dashboard";
  const [requestStatus, setRequestStatus] = useState<Record<string, RequestStatus>>({});
  const [rideStage, setRideStage] = useState(0);
  const [notice, setNotice] = useState("Guest demo active · All rides, fares and actions are simulated.");
  const [vehicle, setVehicle] = useState("Bike");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [supportTopic, setSupportTopic] = useState("Ride issue");
  const [supportSent, setSupportSent] = useState(false);

  const title = section === "rides/request" || section === "instant-rides" ? "Incoming ride requests" :
    section === "active-ride" ? "Active ride" : (contentPages[section]?.title || "Driver page preview");
  const description = section === "rides/request" || section === "instant-rides" ? "Review the pickup, destination and sample fare before accepting or rejecting a request." :
    section === "active-ride" ? "Move through the sample trip stages. This does not contact a passenger or start a real journey." :
    (contentPages[section]?.description || "Explore this driver feature using fictional demo information.");

  function requestAction(id: string, status: RequestStatus) {
    setRequestStatus(previous => ({ ...previous, [id]: status }));
    setNotice(status === "Accepted" ? "Sample request accepted. Open Active ride to try the trip stages." : "Sample request rejected. No real passenger or booking was affected.");
  }

  const shell = (body: React.ReactNode) => (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><DemoMenu /><Link href="/demo" className="text-2xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span></Link></div>
          <div className="flex items-center gap-2"><span className="hidden rounded-full bg-violet-50 px-3 py-1.5 text-xs font-extrabold text-violet-800 sm:inline-flex">GUEST DEMO</span><Link href="/driver/login" className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-sky-700">Driver sign in</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Demo only:</strong> Fictional records and buttons only. No live dispatch, GPS tracking, document uploads, real bookings or payments.</div>
        <div className="mb-5 rounded-2xl bg-gradient-to-br from-sky-700 to-blue-800 p-6 text-white sm:p-8"><p className="text-xs font-extrabold uppercase tracking-widest text-sky-100">Driver workspace · Demo</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50">{description}</p><p className="mt-3 text-sm font-bold">Sample driver · Hyderabad</p></div>
        <p role="status" className="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-900">{notice}</p>
        {body}
        <footer className="py-8 text-center text-xs text-slate-500">RideMitra guest preview · fictional sample information · <Link href="/driver/login" className="font-bold text-sky-700 underline">Sign in for your private account</Link></footer>
      </div>
    </main>
  );

  if (section === "rides/request" || section === "instant-rides") {
    return shell(<div className="space-y-4">
      {sampleRequests.map(request => {
        const status = requestStatus[request.id] || "Waiting";
        return <article key={request.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><p className="text-xs font-extrabold uppercase tracking-wider text-sky-700">{request.id} · {request.vehicle}</p><h2 className="mt-1 text-xl font-black">{request.passenger}</h2></div><div className="text-right"><p className="text-2xl font-black">{cash(request.fare)}</p><p className="text-xs text-slate-500">Sample fare</p></div></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">Pickup</p><p className="mt-1 font-bold">{request.pickup}</p></div><div className="rounded-xl bg-sky-50 p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-sky-800">Destination</p><p className="mt-1 font-bold">{request.drop}</p></div></div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-5"><p className="text-sm text-slate-500">{request.distance}</p>{status === "Waiting" ? <div className="flex gap-2"><button onClick={() => requestAction(request.id, "Rejected")} className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-50">Reject</button><button onClick={() => requestAction(request.id, "Accepted")} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700">Accept ride</button></div> : <span className={"rounded-full px-4 py-2 text-sm font-extrabold " + (status === "Accepted" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>{status === "Accepted" ? "Accepted · Demo" : "Rejected · Demo"}</span>}</div>
          {status === "Accepted" && <div className="border-t border-emerald-100 bg-emerald-50 p-4"><Link href="/demo/active-ride" className="inline-flex rounded-xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white">Continue to active ride →</Link></div>}
        </article>;
      })}
      <Link href="/demo" className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold hover:bg-slate-50">← Back to driver home</Link>
    </div>);
  }

  if (section === "active-ride") {
    const stages = [
      { label: "Ride accepted", detail: "Your sample request has been accepted.", action: "Mark as arriving" },
      { label: "Captain arriving", detail: "The sample driver is heading to the pickup point.", action: "Confirm pickup reached" },
      { label: "At pickup", detail: "In a real trip, verify the rider's trip PIN before starting.", action: "Start sample trip" },
      { label: "Trip in progress", detail: "Sample journey from Madhapur to Gachibowli.", action: "Complete sample trip" },
      { label: "Trip completed", detail: "This sample trip is complete. No real passenger was transported.", action: "" },
    ];
    const stage = stages[rideStage];
    return shell(<div className="mx-auto max-w-3xl"><article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-sky-700">RM-2042 · Bike</p><h2 className="mt-2 text-2xl font-black">{stage.label}</h2><p className="mt-2 text-slate-600">{stage.detail}</p></div><span className="rounded-xl bg-sky-50 px-4 py-2 text-lg font-black text-sky-800">{cash(180)}</span></div><div className="my-7 space-y-4"><div className="flex gap-3"><span className="mt-1 h-3 w-3 rounded-full bg-emerald-500" /><div><p className="text-xs font-bold uppercase text-slate-500">Pickup</p><p className="font-extrabold">Madhapur, Hyderabad</p></div></div><div className="ml-1.5 h-8 border-l-2 border-dashed border-slate-300" /><div className="flex gap-3"><span className="mt-1 h-3 w-3 rounded-full bg-sky-600" /><div><p className="text-xs font-bold uppercase text-slate-500">Destination</p><p className="font-extrabold">Gachibowli, Hyderabad</p></div></div></div><div className="mb-5 grid grid-cols-5 gap-2">{stages.map((s,i)=><div key={s.label} className={"h-2 rounded-full " + (i <= rideStage ? "bg-sky-600" : "bg-slate-200")} />)}</div>{stage.action && <button onClick={() => { setRideStage(s => Math.min(s + 1, stages.length - 1)); setNotice("Demo trip stage updated. No real trip action occurred."); }} className="w-full rounded-xl bg-sky-700 px-5 py-4 font-extrabold text-white hover:bg-sky-800">{stage.action}</button>}{rideStage === stages.length - 1 && <button onClick={() => setRideStage(0)} className="mt-3 w-full rounded-xl border border-sky-200 px-5 py-3 font-bold text-sky-800">Reset sample trip</button>}</article><Link href="/demo/rides/request" className="mt-4 inline-flex text-sm font-bold text-sky-700 underline">← Back to ride requests</Link></div>);
  }

  if (section === "rides") {
    return shell(<div className="grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-extrabold text-sky-700">INCOMING · RM-2042</p><h2 className="mt-2 text-xl font-black">Madhapur → Gachibowli</h2><p className="mt-2 text-sm text-slate-500">Bike · sample fare {cash(180)}</p><Link href="/demo/rides/request" className="mt-4 inline-flex rounded-xl bg-sky-700 px-4 py-3 text-sm font-extrabold text-white">Review request →</Link></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-extrabold text-emerald-700">ACTIVE · RM-2038</p><h2 className="mt-2 text-xl font-black">Jubilee Hills → Banjara Hills</h2><p className="mt-2 text-sm text-slate-500">Cab · sample fare {cash(150)}</p><Link href="/demo/active-ride" className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white">Open active ride →</Link></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-extrabold text-slate-500">COMPLETED · RM-2014</p><h2 className="mt-2 text-xl font-black">Madhapur → Kondapur</h2><p className="mt-2 text-sm text-slate-500">Bike · sample fare {cash(135)}</p><Link href="/demo/history" className="mt-4 inline-flex text-sm font-bold text-sky-700 underline">View ride history →</Link></article></div>);
  }

  if (section === "earnings") {
    return shell(<><div className="grid gap-4 sm:grid-cols-3">{[["Today's earnings",cash(485)],["Completed trips","3"],["Weekly sample total",cash(2840)]].map(([label,value])=><article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-400">Illustrative only</p></article>)}</div><article className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-black">Recent sample rides</h2>{[["RM-2014","Madhapur → Kondapur","₹135"],["RM-2012","Gachibowli → Financial District","₹210"],["RM-2009","Jubilee Hills → Banjara Hills","₹140"]].map(([id,route,fare])=><div key={id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-0"><div><p className="text-xs font-bold text-slate-500">{id}</p><p className="mt-1 font-bold">{route}</p></div><span className="font-black">{fare}</span></div>)}</article><p className="mt-4 text-sm text-amber-800">Payouts and withdrawals are not connected in this demo.</p></>);
  }

  if (section === "history") {
    return shell(<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{[["RM-2014","Madhapur → Kondapur","Today, 9:20 AM","₹135"],["RM-2012","Gachibowli → Financial District","Yesterday, 6:45 PM","₹210"],["RM-2009","Jubilee Hills → Banjara Hills","Yesterday, 2:10 PM","₹140"]].map(([id,route,date,fare])=><article key={id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 last:border-0"><div><p className="text-xs font-extrabold text-slate-500">{id} · COMPLETED</p><h2 className="mt-1 font-extrabold">{route}</h2><p className="mt-1 text-sm text-slate-500">{date}</p></div><p className="text-lg font-black">{fare}</p></article>)}</div>);
  }

  if (section === "trips") {
    return shell(<div className="grid gap-4 md:grid-cols-2">{[["Hyderabad","Warangal","Tomorrow · 8:30 AM","3 seats","₹450 / seat"],["Hyderabad","Vijayawada","Friday · 7:00 AM","2 seats","₹700 / seat"]].map(([from,to,time,seats,price])=><article key={to} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-extrabold uppercase tracking-wider text-sky-700">Shared journey · Demo</p><h2 className="mt-3 text-xl font-black">{from} → {to}</h2><p className="mt-2 text-sm text-slate-500">{time} · {seats}</p><p className="mt-4 text-2xl font-black">{price}</p><button onClick={() => setNotice("Selected the sample " + to + " journey. No real seat was reserved.")} className="mt-4 rounded-xl border border-sky-200 px-4 py-3 text-sm font-extrabold text-sky-800 hover:bg-sky-50">Select sample journey</button></article>)}</div>);
  }

  if (section === "documents") {
    return shell(<div className="space-y-3">{[["Driving licence","Required for real driver verification"],["Vehicle registration (RC)","Vehicle details must match"],["Vehicle insurance","Keep insurance details current"],["Profile photo & identity","Used for account verification"]].map(([name,detail])=><article key={name} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"><div><h2 className="font-extrabold">{name}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p></div><span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-extrabold text-violet-800">Preview only</span></article>)}<p className="text-sm text-amber-800">No files are selected or uploaded. Complete genuine verification only through the secured signed-in workflow.</p></div>);
  }

  if (section === "profile") {
    return shell(<article className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6"><div className="mb-6 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl font-black text-sky-800">D</div><div><h2 className="text-xl font-black">Demo Driver</h2><p className="text-sm text-slate-500">Sample profile · Hyderabad</p></div></div><label className="block text-sm font-bold">Preferred vehicle<select value={vehicle} onChange={e=>setVehicle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"><option>Bike</option><option>Auto</option><option>Cab</option></select></label><button onClick={() => setNotice("Demo vehicle preference set to " + vehicle + ". It was not saved to a real account.")} className="mt-4 rounded-xl bg-sky-700 px-5 py-3 text-sm font-extrabold text-white">Save demo preference</button><p className="mt-4 text-xs text-slate-500">Changes stay in this page session only.</p></article>);
  }

  if (section === "notifications") {
    return shell(<article className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-extrabold">Demo notifications</h2><p className="mt-1 text-sm text-slate-500">Toggle is only a local preview preference.</p></div><button onClick={() => setNotificationsOn(v=>!v)} className={"rounded-xl px-4 py-2.5 text-sm font-extrabold " + (notificationsOn ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600")}>{notificationsOn ? "Enabled" : "Muted"}</button></div>{[["New ride request","A nearby sample request is waiting."],["Verification reminder","Check that your driver documents are up to date."],["Weekly summary","Your illustrative weekly activity summary is available."]].map(([name,detail])=><div key={name} className="border-t border-slate-100 py-4 first:mt-5"><h3 className="font-bold">{name}</h3><p className="mt-1 text-sm text-slate-500">{detail}</p></div>)}</article>);
  }

  if (section === "support") {
    return shell(<form onSubmit={e=>{e.preventDefault();setSupportSent(true);setNotice("Demo support request recorded on screen only. Nothing was sent to a support team.");}} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6"><label className="block text-sm font-bold">What do you need help with?<select value={supportTopic} onChange={e=>setSupportTopic(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"><option>Ride issue</option><option>Account / verification</option><option>Earnings question</option><option>App settings</option></select></label><button className="mt-4 rounded-xl bg-sky-700 px-5 py-3 text-sm font-extrabold text-white">Preview support request</button>{supportSent && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Preview created for: {supportTopic}. This was not sent.</p>}</form>);
  }

  if (section === "settings") {
    return shell(<div className="max-w-2xl space-y-3">{[["Notifications","Preview alerts preference"],["Language","English"],["Privacy","Guest demo does not request GPS or upload documents"]].map(([name,detail])=><article key={name} className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-extrabold">{name}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p></article>)}<Link href="/driver/login" className="inline-flex rounded-xl bg-sky-700 px-5 py-3 text-sm font-extrabold text-white">Open secure account settings →</Link></div>);
  }

  return shell(<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{nav.filter(([label,href])=>href!=="/demo").map(([label,href])=><Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-sky-300 hover:shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="font-extrabold">{label}</h2><span className="text-xl text-sky-700">→</span></div><p className="mt-2 text-sm text-slate-500">Open the dedicated {label.toLowerCase()} demo page.</p></Link>)}</div>);
}
