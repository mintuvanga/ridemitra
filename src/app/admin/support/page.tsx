"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Ticket={id:string;subject:string;category:string;message:string;status:string;created_at:string;full_name:string;email:string};
export default function AdminSupportPage(){
 const [tickets,setTickets]=useState<Ticket[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [filter,setFilter]=useState("all");
 async function load(silent=false){
  if(!silent)setLoading(true);
  setError("");
  try{
   const r=await fetch("/api/admin/support",{cache:"no-store"});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||"Unable to load queue");
   setTickets(d.tickets||[]);
  }catch(e){setError(e instanceof Error?e.message:"Unable to load queue");}
  finally{setLoading(false);}
 }
 useEffect(()=>{
  void load();
  const timer=window.setInterval(()=>void load(true),30000);
  return()=>window.clearInterval(timer);
 },[]);
 async function update(id:string,status:string){
  setError("");
  try{
   const r=await fetch("/api/admin/support",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||"Update failed");
   setTickets(old=>old.map(t=>t.id===id?{...t,status}:t));
  }catch(e){setError(e instanceof Error?e.message:"Update failed");}
 }
 const counts={open:tickets.filter(t=>t.status==="open").length,inProgress:tickets.filter(t=>t.status==="in_progress").length,resolved:tickets.filter(t=>t.status==="resolved"||t.status==="closed").length};
 const visible=tickets.filter(t=>filter==="all"||t.status===filter).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
 return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-5xl">
  <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-sky-600">Admin tools</p><h1 className="mt-1 text-3xl font-black">Support queue</h1></div><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>void load()} className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-sky-700">Refresh ↻</button><Link href="/admin/driver-verification" className="rounded-xl border bg-white px-4 py-2 text-sm font-bold">Driver verification</Link></div></header>
  <p className="mt-3 text-sm text-slate-600">Review incoming requests and update their status. The queue refreshes automatically every 30 seconds. Access is restricted to the configured admin account.</p>
  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-sky-100 bg-white p-4"><p className="text-sm text-slate-500">Open</p><p className="mt-1 text-2xl font-black">{counts.open}</p></div><div className="rounded-2xl border border-sky-100 bg-white p-4"><p className="text-sm text-slate-500">In progress</p><p className="mt-1 text-2xl font-black">{counts.inProgress}</p></div><div className="rounded-2xl border border-sky-100 bg-white p-4"><p className="text-sm text-slate-500">Resolved / closed</p><p className="mt-1 text-2xl font-black">{counts.resolved}</p></div></div>
  <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Requests <span className="text-sm font-medium text-slate-500">({visible.length})</span></h2><label className="flex items-center gap-2 text-sm font-bold">Filter status <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2"><option value="all">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label></div>
  {error&&<p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
  {loading?<p className="mt-8">Loading requests…</p>:visible.length===0?<p className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{tickets.length===0?"No support tickets found.":"No tickets match this status filter."}</p>:<div className="mt-4 space-y-4">{visible.map(t=><article key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><h3 className="text-lg font-extrabold">{t.subject}</h3><p className="mt-1 break-words text-xs text-slate-500">{t.full_name} · {t.email} · {new Date(t.created_at).toLocaleString()}</p></div><select aria-label={"Status for "+t.subject} value={t.status} onChange={e=>void update(t.id,e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div><p className="mt-3 text-xs font-bold uppercase tracking-wide text-sky-700">{t.category}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{t.message}</p></article>)}</div>}
 </div></main>;
}
