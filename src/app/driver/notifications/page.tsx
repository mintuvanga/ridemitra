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
 return <main className="min-h-screen bg-[#071827] px-3 pb-24 pt-4 text-[#edf7f7] sm:px-4"><div className="mx-auto w-full max-w-[520px]">
 <header className="sticky top-0 z-[800] flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#071827]/95 px-3 py-3 shadow-lg backdrop-blur-xl"><Link href="/driver/instant-rides" className="text-lg font-black">Ride<span className="text-emerald-300">Mitra</span></Link><Link href="/driver/instant-rides" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-200">← Dashboard</Link></header>
 <section className="mt-4 rounded-3xl border border-white/10 bg-[#0b2234] p-5 shadow-xl shadow-black/10 sm:p-6">
 <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-200">Driver workspace</p><h1 className="mt-2 text-2xl font-black">Ride activity</h1>
 <p className="mt-2 text-sm leading-6 text-slate-400">Recent instant-ride and shared-journey statuses from your account. Updates check automatically every 20 seconds.</p>
 <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter ride activity">{([{value:"all",label:"All activity"},{value:"instant",label:"Instant rides"},{value:"shared",label:"Shared journeys"}] as const).map(item=><button key={item.value} type="button" aria-pressed={filter===item.value} onClick={()=>setFilter(item.value)} className={`rounded-xl border px-3 py-2 text-sm font-bold ${filter===item.value?"border-emerald-300 bg-emerald-300 text-[#062033]":"border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>{item.label}</button>)}<button type="button" onClick={()=>void load()} disabled={loading} className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-200 disabled:opacity-50">{loading?"Loading…":"Refresh ↻"}</button></div>
 {signedOut&&<div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">Sign in to view private ride updates. <Link href="/driver/login" className="font-bold text-emerald-200 underline">Driver login</Link></div>}
 {error&&<p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</p>}
 {loading?<p className="mt-6 text-sm text-slate-400">Loading updates…</p>:!signedOut&&visible.length===0?<p className="mt-6 rounded-2xl border border-white/10 bg-[#071827] p-5 text-sm text-slate-400">{events.length===0?"No ride activity yet. New booking and ride status changes will appear here when they exist.":"No activity in this category yet."}</p>:<div className="mt-6 space-y-3">{visible.map(e=><article key={e.id} className="flex gap-3 rounded-2xl border border-white/10 bg-[#071827] p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${e.status==="completed"?"bg-emerald-300/10 text-emerald-200":e.status==="pending"?"bg-amber-300/10 text-amber-200":"bg-cyan-300/10 text-cyan-200"}`} aria-hidden="true">{e.status==="completed"?"✓":e.status==="pending"?"!":"↗"}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-extrabold">{e.title}</h2><span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300">{e.status.replace(/_/g," ")}</span></div><p className="mt-1 text-sm text-slate-300">{e.detail}</p><p className="mt-2 text-xs text-slate-500">{new Date(e.date).toLocaleString()}</p><p className="mt-1 text-xs font-semibold text-slate-500">{e.kind==="instant"?"Instant ride":"Shared journey"}</p><Link href={e.href} className="mt-3 inline-flex text-sm font-bold text-emerald-200 underline">Open details →</Link></div></article>)}</div>}
 </section></div>
 <nav aria-label="Driver app navigation" className="fixed inset-x-0 bottom-0 z-[850] border-t border-white/10 bg-[#071827]/95 px-2 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 backdrop-blur-xl"><div className="mx-auto grid w-full max-w-[520px] grid-cols-4 gap-1">
 <Link href="/driver/instant-rides" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-emerald-200"><span className="text-xl leading-5">⌂</span><span className="text-[10px] font-extrabold">Home</span></Link>
 <Link href="/driver/new-ride-requests" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-emerald-200"><span className="text-xl leading-5">＋</span><span className="text-[10px] font-extrabold">New rides</span></Link>
 <Link href="/driver/earnings" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-slate-100"><span className="text-xl leading-5">₹</span><span className="text-[10px] font-extrabold">Earnings</span></Link>
 <Link href="/driver/instant-rides" aria-label="More options" className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-slate-400 transition hover:text-slate-100"><span className="text-2xl leading-5">⋯</span><span className="text-[10px] font-extrabold">More</span></Link>
 </div></nav></main>;
}
