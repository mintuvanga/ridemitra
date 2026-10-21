"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Ticket = { id: string; subject: string; category: string; message: string; status: string; created_at: string };
const choices = [
  ["account", "Account and login"], ["rides", "Instant rides"], ["journeys", "Shared journeys"],
  ["verification", "Driver verification"], ["payments", "Fare and earnings"], ["other", "Other"]
];
function statusLabel(status: string) {
  return status === "in_progress" ? "In progress" : status.replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
}
export default function DriverSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("account");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/driver/support", { cache: "no-store" });
      const data = await r.json();
      if (r.status === 401) { setSignedOut(true); return; }
      if (!r.ok) throw new Error(data.error || "Could not load requests.");
      setSignedOut(false);
      setTickets(data.tickets || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load requests.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const r = await fetch("/api/driver/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, category, message }) });
      const data = await r.json();
      if (r.status === 401) { setSignedOut(true); throw new Error("Your session has expired. Please sign in again."); }
      if (!r.ok) throw new Error(data.error || "Could not submit request.");
      setTickets(current => [data.ticket, ...current.filter(t => t.id !== data.ticket.id)]);
      setSubject(""); setMessage("");
      setNotice("Your support request has been saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit request.");
    } finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-[#071827] px-3 pb-28 pt-4 text-slate-100 sm:px-6 sm:py-8 text-slate-100">
    <div className="mx-auto max-w-3xl">
      <header className="flex items-center justify-between gap-4">
        <Link href="/driver" className="text-xl font-black">Ride<span className="text-emerald-300">Mitra</span></Link>
        <Link href="/driver" className="rounded-xl border border-slate-600 bg-[#0b2234] px-4 py-2 text-sm font-bold text-emerald-300">← Dashboard</Link>
      </header>
      <section className="mt-8 rounded-3xl border border-slate-700 bg-[#0b2234] p-6 shadow-lg shadow-black/10 sm:p-9">
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">Help centre</p>
        <h1 className="mt-2 text-3xl font-black">Driver support</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">Submit a request and check its status here. Your request history refreshes automatically every 30 seconds. Do not include passwords, OTPs, or card details.</p>
        {signedOut ? <div className="mt-6 rounded-2xl bg-amber-50 p-5"><p className="font-bold">Sign in required</p><p className="mt-1 text-sm text-slate-300">Sign in to submit a request or view your private support history.</p><Link href="/driver/login" className="mt-3 inline-flex rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-white">Go to login →</Link></div> : <>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div><label htmlFor="category" className="mb-2 block text-sm font-bold">Category</label><select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#0b2234] px-4 py-3">{choices.map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}</select></div>
            <div><label htmlFor="subject" className="mb-2 block text-sm font-bold">Subject</label><input id="subject" required minLength={4} maxLength={120} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Briefly describe the issue" className="w-full rounded-xl border border-slate-700 px-4 py-3" /></div>
            <div><label htmlFor="message" className="mb-2 block text-sm font-bold">Message</label><textarea id="message" required minLength={10} maxLength={3000} rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what happened" className="w-full rounded-xl border border-slate-700 px-4 py-3" /></div>
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
            {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
            <button disabled={saving} className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 font-extrabold text-white disabled:opacity-60">{saving ? "Submitting…" : "Submit support request"}</button>
          </form>
          <div className="mt-10 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Your requests <span className="text-sm font-semibold text-slate-400">({tickets.length})</span></h2><button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-slate-600 bg-[#0b2234] px-3 py-2 text-sm font-bold text-emerald-300 disabled:opacity-50">{loading ? "Refreshing…" : "Refresh ↻"}</button></div>
            {loading ? <p className="mt-4 text-sm text-slate-400">Loading requests…</p> : tickets.length === 0 ? <p className="mt-4 rounded-xl bg-slate-800/70 p-4 text-sm text-slate-300">No support requests yet.</p> : <div className="mt-4 space-y-3">{tickets.map(t => <article key={t.id} className="rounded-2xl border border-slate-700 p-4"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-extrabold">{t.subject}</h3><span className={`rounded-full px-3 py-1 text-xs font-bold ${t.status === "resolved" || t.status === "closed" ? "bg-emerald-50 text-emerald-700" : t.status === "in_progress" ? "bg-amber-50 text-amber-800" : "bg-emerald-950/40 text-emerald-300"}`}>{statusLabel(t.status)}</span></div><p className="mt-1 text-xs text-slate-400">{choices.find(c => c[0] === t.category)?.[1] || t.category} · {new Date(t.created_at).toLocaleString()}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{t.message}</p></article>)}</div>}
          </div>
        </>}
      </section>
    </div>

      <nav aria-label="Driver navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-700 bg-[#071827]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {[{ label: "Home", icon: "⌂", href: "/driver/instant-rides" }, { label: "New rides", icon: "◉", href: "/driver/new-ride-requests" }, { label: "Earnings", icon: "₹", href: "/driver/earnings" }, { label: "More", icon: "☰", href: "/driver/instant-rides" }].map(item => (
            <Link key={item.label} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-emerald-300">
              <span className="text-lg leading-none">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
  </main>;
}
