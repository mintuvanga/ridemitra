"use client";
import Link from "next/link";
const rows = [
  { id: "DM-1021", route: "Jubilee Hills → Banjara Hills", date: "Yesterday", amount: "₹150" },
  { id: "DM-1014", route: "Madhapur → Kondapur", date: "17 Oct", amount: "₹135" },
  { id: "DM-1009", route: "Gachibowli → Financial District", date: "16 Oct", amount: "₹210" }
];
export default function DemoEarningsPage() {
  return <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-6 text-slate-900 sm:px-6"><div className="mx-auto max-w-5xl">
    <header className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white px-5 py-4 shadow-sm"><Link href="/demo" className="text-xl font-black">Ride<span className="text-sky-600">Mitra</span></Link><span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-extrabold text-violet-800">DEMO DATA</span></header>
    <section className="mt-6 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-7 text-white"><p className="text-xs font-bold uppercase tracking-widest text-sky-100">Driver workspace · Demo</p><h1 className="mt-3 text-4xl font-black">Earnings & payouts</h1><p className="mt-3 text-sky-50">Fictional amounts to preview the earnings interface. No payment provider is connected.</p></section>
    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Demo only:</strong> These are sample figures, not money earned or available to withdraw.</p>
    <section className="mt-5 grid gap-4 sm:grid-cols-3">{[["Total sample earnings","₹4,850"],["This week","₹1,240"],["Sample pending payout","₹620"]].map(([label,value])=><article key={label} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">Illustrative amount only</p></article>)}</section>
    <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Sample earnings activity</h2><div className="mt-5 space-y-3">{rows.map(row=><article key={row.id} className="rounded-2xl border border-sky-100 p-4 sm:flex sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-sky-700">{row.id} · {row.date}</p><h3 className="mt-2 font-extrabold">{row.route}</h3></div><p className="mt-3 text-xl font-black sm:mt-0">{row.amount}</p></article>)}</div></section>
    <section className="mt-5 rounded-2xl border border-sky-100 bg-white p-5"><h2 className="font-extrabold">Payout setup</h2><p className="mt-2 text-sm text-slate-600">Payouts are disabled. Do not enter bank details or expect transfers from sample balances.</p></section>
    <nav className="mt-5 grid gap-3 sm:grid-cols-3"><Link className="rounded-xl border border-sky-200 bg-white p-3 text-center font-bold text-sky-700" href="/demo">← Demo home</Link><Link className="rounded-xl bg-sky-600 p-3 text-center font-bold text-white" href="/demo/rides">Demo rides →</Link><Link className="rounded-xl border border-sky-200 bg-white p-3 text-center font-bold text-sky-700" href="/driver/earnings">Live earnings UI</Link></nav>
  </div></main>;
}
