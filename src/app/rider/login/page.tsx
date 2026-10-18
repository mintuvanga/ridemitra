"use client";

import { useState } from "react";
import Link from "next/link";

export default function RiderLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      window.location.href = "/rider/onboarding";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center">
        <Link href="/" className="mb-8 text-sm text-emerald-400">← RideMitra</Link>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-3xl">🏍️</div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">Rider account</p>
        <h1 className="mt-3 text-3xl font-black">Your journey starts here.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Sign in with your verified RideMitra account to continue rider registration.</p>
        <form onSubmit={signIn} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold">Email address
            <input type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none placeholder:text-slate-500 focus:border-emerald-400" />
          </label>
          <label className="block text-sm font-semibold">Password
            <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none placeholder:text-slate-500 focus:border-emerald-400" />
          </label>
          <button disabled={busy} className="w-full rounded-2xl bg-emerald-400 px-4 py-4 font-bold text-slate-950 disabled:opacity-50">{busy ? "Signing in..." : "Sign in →"}</button>
        </form>
        {message && <p role="status" className="mt-4 break-words text-sm text-rose-300">{message}</p>}
        <p className="mt-6 text-sm text-slate-400">Need an account? <Link href="/signup" className="text-emerald-400">Create one</Link></p>
        <p className="mt-8 text-xs leading-5 text-slate-500">Email verification is required. Rider document checks are a separate step.</p>
      </div>
    </main>
  );
}
