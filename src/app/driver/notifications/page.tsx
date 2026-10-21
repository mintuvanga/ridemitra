"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
type Ride={id:string;pickup:string;destination:string;status:string;updated_at:string};
type Booking={id:string;status:string;created_at:string;origin_city:string;destination_city:string};
type Activity={id:string;title:string;detail:string;status:string;date:string;href:string;kind:"instant"|"shared"};
function titleFor(status:string,kind:"instant"|"shared"){
 if(kind==="instant")return status==="accepted"?"Instant ride accepted":status==="arriving"?"Marked as arriving":status==="in_progress"?"Ride in progress":status==="completed"?"Ride completed":status==="cancelled"?"Ride cancelled":"Ride status updated";
 return status==="pending"?"New shared journey booking request":status==="confirmed"?"Booking confirmed":status==="completed"?"Booking completed":status==="cancelled"?"Booking cancelled":"Booking updated";
}
export default function DriverNotificationsPage(){
 const [rides,setRides]=useState<Ride[]>([]);
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [signedOut,setSignedOut]=useState(false);
 const [filter,setFilter]=useState<"all"|"instant"|"shared">("all");
 async function load(silent=false){
  if(!silent)setLoading(true);
  setError("");
  try{
   const r=await fetch("/api/driver/notifications",{cache:"no-store"});
   const d=await r.json();
   if(r.status===401){setSignedOut(true);setRides([]);setBookings([]);return;}
   if(!r.ok)throw new Error(d.error||"Unable to load updates");
   setSignedOut(false);setRides(d.rides||[]);setBookings(d.bookings||[]);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load updates");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void load();const timer=window.setInterval(()=>void load(true),20000);return()=>window.clearInterval(timer);},[]);
 const events=useMemo<Activity[]>(()=>[
  ...rides.map(r=>({id:"r"+r.id,title:titleFor(r.status,"instant"),detail:r.pickup+" → "+r.destination,status:r.status,date:r.updated_at,href:"/driver/instant-rides",kind:"instant" as const})),
  ...bookings.map(b=>({id:"b"+b.id,title:titleFor(b.status,"shared"),detail:b.origin_city+" → "+b.destination_city,status:b.status,date:b.created_at,href:"/driver/trips",kind:"shared" as const}))
 ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()),[rides,bookings]);
 const visible=filter==="all"?events:events.filter(e=>e.kind===filter);
 return <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-3xl">
 <header className="flex items-center justify-between gap-3"><Link href="/driver" className="text-xl font-black">Ride<span className="text-sky-600">Mitra</span></Link><Link href="/driver" className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-sky-700">← Dashboard</Link></header>
 <section className="mt-8 rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
 <p className="text-xs font-extrabold uppercase tracking-widest text-sky-600">Driver workspace</p><h1 className="mt-2 text-3xl font-black">Ride activity</h1>
 <p className="mt-2 text-sm leading-6 text-slate-600">Recent instant-ride and shared-journey statuses from your account. Updates check automatically every 20 seconds.</p>
 <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter ride activity">{([{value:"all",label:"All activity"},{value:"instant",label:"Instant rides"},{value:"shared",label:"Shared journeys"}] as const).map(item=><button key={item.value} type="button" aria-pressed={filter===item.value} onClick={()=>setFilter(item.value)} className={`rounded-xl border px-3 py-2 text-sm font-bold ${filter===item.value?"border-sky-600 bg-sky-600 text-white":"border-sky-200 bg-white text-sky-700 hover:bg-sky-50"}`}>{item.label}</button>)}<button type="button" onClick={()=>void load()} disabled={loading} className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">{loading?"Loading…":"Refresh ↻"}</button></div>
 {signedOut&&<div className="mt-5 rounded-xl bg-amber-50 p-4">Sign in to view private ride updates. <Link href="/driver/login" className="font-bold text-sky-700 underline">Driver login</Link></div>}
 {error&&<p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
 {loading?<p className="mt-6 text-sm text-slate-500">Loading updates…</p>:!signedOut&&visible.length===0?<p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">{events.length===0?"No ride activity yet. New booking and ride status changes will appear here when they exist.":"No activity in this category yet."}</p>:<div className="mt-6 space-y-3">{visible.map(e=><article key={e.id} className="flex gap-3 rounded-2xl border border-slate-200 p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${e.status==="completed"?"bg-emerald-100 text-emerald-800":e.status==="pending"?"bg-amber-100 text-amber-800":"bg-sky-100 text-sky-800"}`} aria-hidden="true">{e.status==="completed"?"✓":e.status==="pending"?"!":"↗"}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-extrabold">{e.title}</h2><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">{e.status.replace(/_/g," ")}</span></div><p className="mt-1 text-sm text-slate-600">{e.detail}</p><p className="mt-2 text-xs text-slate-400">{new Date(e.date).toLocaleString()}</p><p className="mt-1 text-xs font-semibold text-slate-400">{e.kind==="instant"?"Instant ride":"Shared journey"}</p><Link href={e.href} className="mt-3 inline-flex text-sm font-bold text-sky-700 underline">Open details →</Link></div></article>)}</div>}
 </section></div></main>;
}
