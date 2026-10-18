"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
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
      if (!response.ok) throw new Error(result.error || "Sign-in failed.");
      window.location.href = "/trips";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="text-sm font-semibold text-blue-700">← RideMitra</Link>
      <h1 className="mt-8 text-3xl font-bold">Welcome back</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input required type="email" autoComplete="email" placeholder="Email address" className="w-full rounded-lg border p-3" value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" autoComplete="current-password" placeholder="Password" className="w-full rounded-lg border p-3" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={busy} className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {message && <p role="status" className="mt-4 break-words text-sm text-red-700">{message}</p>}
      <p className="mt-5 text-sm">New to RideMitra? <Link href="/signup" className="text-blue-700">Create an account</Link></p>
      <p className="mt-3 text-sm"><Link href="/rider/login" className="text-blue-700">Rider account</Link></p>
    </main>
  );
}
