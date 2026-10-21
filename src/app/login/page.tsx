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
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Sign-in failed.");
      window.location.href = "/trips";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100svh", boxSizing: "border-box", display: "grid", placeItems: "center", padding: "max(20px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom))", color: "#f8fafc", background: "radial-gradient(ellipse at 12% 12%,rgba(16,185,129,.2),transparent 32%),#071827", fontFamily: "Inter,Arial,sans-serif" }}>
      <section style={{ width: "100%", maxWidth: 440, boxSizing: "border-box", padding: "clamp(22px,6vw,38px)", borderRadius: 28, border: "1px solid #294357", background: "linear-gradient(155deg,#102638,#0a1b29)", boxShadow: "0 28px 80px rgba(0,0,0,.35)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#f8fafc", textDecoration: "none", fontSize: 21, fontWeight: 900, marginBottom: 28 }}><span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 50, background: "#10b981", color: "#05251e" }}>↗</span>Ride<span style={{ color: "#34d399", marginLeft: -9 }}>Mitra</span></Link>
        <p style={{ margin: "0 0 9px", color: "#6ee7b7", fontSize: 11, fontWeight: 850, letterSpacing: 2.2 }}>RIDER ACCOUNT</p>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(30px,7vw,38px)", lineHeight: 1.1, letterSpacing: "-1px", fontWeight: 900 }}>Welcome back</h1>
        <p style={{ margin: "0 0 24px", color: "#a8bac8", fontSize: 14, lineHeight: 1.7 }}>Sign in to continue with RideMitra.</p>
        <form onSubmit={submit}>
          <label htmlFor="rider-email" style={{ display: "block", margin: "17px 0 8px", color: "#d9e5ec", fontSize: 13, fontWeight: 750 }}>Email address</label>
          <input id="rider-email" required type="email" autoComplete="email" placeholder="you@example.com" style={{ boxSizing: "border-box", width: "100%", minHeight: 54, borderRadius: 13, border: "1px solid #345166", padding: 15, background: "#0a1c2a", color: "#fff", fontSize: 16 }} value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="rider-password" style={{ display: "block", margin: "17px 0 8px", color: "#d9e5ec", fontSize: 13, fontWeight: 750 }}>Password</label>
          <input id="rider-password" required type="password" autoComplete="current-password" placeholder="Enter your password" style={{ boxSizing: "border-box", width: "100%", minHeight: 54, borderRadius: 13, border: "1px solid #345166", padding: 15, background: "#0a1c2a", color: "#fff", fontSize: 16 }} value={password} onChange={e => setPassword(e.target.value)} />
          {message && <p role="alert" style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "#351a25", color: "#fecaca", fontSize: 13 }}>{message}</p>}
          <button disabled={busy} style={{ width: "100%", minHeight: 54, marginTop: 24, padding: 15, border: 0, borderRadius: 14, background: "linear-gradient(100deg,#10b981,#34d399)", color: "#05251e", fontSize: 15, fontWeight: 900, opacity: busy ? .7 : 1 }}>{busy ? "Signing in…" : "Sign in  →"}</button>
        </form>
        <p style={{ marginTop: 20, color: "#9bb0bf", fontSize: 13 }}>New to RideMitra? <Link href="/signup" style={{ color: "#6ee7b7", fontWeight: 800 }}>Create an account</Link></p>
        <p style={{ marginTop: 12, color: "#9bb0bf", fontSize: 13 }}>Driving with us? <Link href="/driver/login" style={{ color: "#6ee7b7", fontWeight: 800 }}>Driver sign in</Link></p>
      </section>
    </main>
  );
}
