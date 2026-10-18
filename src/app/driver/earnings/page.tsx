"use client";

import Link from "next/link";

export default function DriverEarningsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-5 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm sm:px-6">
          <Link href="/driver" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span><span className="ml-2 text-sm font-semibold text-slate-500">Driver</span></Link>
          <Link href="/support" className="rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">Help & support ↗</Link>
        </header>

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-600 to-blue-700 p-6 text-white shadow-xl shadow-sky-200 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Driver workspace</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Earnings & payouts</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">Track ride income and payout activity in one place. Your actual totals will appear when completed rides and payment processing are connected.</p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Total earnings", icon: "₹", detail: "Completed ride income" },
            { title: "This week", icon: "▥", detail: "Weekly earnings summary" },
            { title: "Pending payout", icon: "↗", detail: "Transfers awaiting payment" },
          ].map(item => (
            <article key={item.title} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{item.title}</p><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-xl font-black text-sky-700">{item.icon}</span></div>
              <p className="mt-4 text-3xl font-black">—</p>
              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">Earnings activity</h2><p className="mt-1 text-sm text-slate-500">Your ride-by-ride income statement</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">Not connected</span></div>
            <div className="mt-5 rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-5 py-9 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">📊</div>
              <h3 className="mt-4 font-extrabold">No earnings data yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">RideMitra has not connected completed-trip records to an earnings ledger. We will show real amounts here when that service is implemented.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-black">Payout setup</h2>
            <p className="mt-1 text-sm text-slate-500">Payment destination and transfer status</p>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <span className="text-xl" aria-hidden="true">🔒</span>
              <div><p className="font-extrabold text-amber-900">Payouts are not enabled</p><p className="mt-1 text-sm leading-5 text-amber-800">A secure payment provider, verified driver account and payout configuration are required before transfers can be made.</p></div>
            </div>
            <Link href="/support" className="mt-4 flex w-full items-center justify-center rounded-xl border border-sky-200 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50">Ask support about payouts ↗</Link>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Keep your driver account ready</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Driver verification must be completed before rides can be accepted. Earnings and payouts will remain unavailable until the trip and payment systems are active.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href="/driver/documents" className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-sky-700">Complete verification →</Link>
            <Link href="/driver/rides" className="inline-flex items-center justify-center rounded-xl border border-sky-200 px-5 py-3 text-sm font-bold text-sky-700 hover:bg-sky-50">View my rides</Link>
          </div>
        </section>

        <nav className="mt-6 grid grid-cols-3 gap-3" aria-label="Driver navigation">
          <Link href="/driver" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">⌂</span><span className="mt-1 block">Dashboard</span></Link>
          <Link href="/driver/rides" className="rounded-2xl border border-sky-100 bg-white p-4 text-center text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50"><span className="block text-xl">🛺</span><span className="mt-1 block">My rides</span></Link>
          <Link href="/driver/earnings" aria-current="page" className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-center text-sm font-bold text-sky-700"><span className="block text-xl">₹</span><span className="mt-1 block">Earnings</span></Link>
        </nav>
        <footer className="py-7 text-center text-xs text-slate-500">RideMitra Driver · Earnings shown only when backed by verified trip and payment records.</footer>
      </div>
    </main>
  );
}
