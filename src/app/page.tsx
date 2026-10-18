"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      window.location.href = "/driver/documents";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-5 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[90vh] max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-2xl text-white shadow-lg shadow-sky-200">🚘</div>
          <div>
            <p className="text-2xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span></p>
            <p className="text-sm font-medium text-slate-500">Driver partner app</p>
          </div>
        </div>
        <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100/70 sm:p-8">
          <div className="mb-6 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">Driver access</div>
          <h1 className="text-3xl font-black tracking-tight">Welcome back.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue your driver registration and document verification.</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Email address
              <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Password
              <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
            </label>
            <button disabled={busy} className="w-full rounded-xl bg-sky-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:opacity-60">{busy ? "Signing in..." : "Sign in as driver →"}</button>
          </form>
          {message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-100" />NEW TO RIDEMITRA<span className="h-px flex-1 bg-slate-100" /></div>
          <Link href="/signup" className="flex w-full items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 font-bold text-sky-800 transition hover:bg-sky-100">Create driver account</Link>
        </section>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"><span aria-hidden="true">🔒</span> Your documents must be reviewed before driver approval.</div>
        <p className="mt-5 text-center text-xs text-slate-400">RideMitra Driver · Light, clear, secure.</p>
      </div>
    </main>
  );
}
