"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const styles = {
  page: { minHeight: "100svh", boxSizing: "border-box" as const, display: "flex", alignItems: "center", justifyContent: "center", padding: "max(20px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom))", background: "radial-gradient(ellipse at 15% 10%,rgba(16,185,129,.2),transparent 32%),radial-gradient(ellipse at 90% 90%,rgba(14,165,233,.12),transparent 35%),#071827", color: "#f8fafc", fontFamily: "Inter,Arial,sans-serif" },
  card: { boxSizing: "border-box" as const, width: "100%", maxWidth: "440px", padding: "clamp(22px,6vw,38px)", border: "1px solid #294357", borderRadius: "28px", background: "linear-gradient(155deg,#102638,#0a1b29)", boxShadow: "0 28px 80px rgba(0,0,0,.35)" },
  mark: { display: "grid", placeItems: "center", width: "60px", height: "60px", marginBottom: "22px", borderRadius: "50%", background: "linear-gradient(145deg,#6ee7b7,#10b981)", boxShadow: "0 10px 26px rgba(16,185,129,.25)", color: "#05251e", fontSize: "30px", fontWeight: 900 },
  eyebrow: { margin: "0 0 10px", color: "#6ee7b7", fontSize: "11px", fontWeight: 850, letterSpacing: "2.4px" },
  heading: { margin: "0 0 12px", fontSize: "clamp(29px,7vw,38px)", lineHeight: 1.1, letterSpacing: "-1.2px", fontWeight: 900, color: "#f8fafc" },
  subtitle: { margin: "0 0 25px", color: "#a8bac8", fontSize: "14px", lineHeight: 1.7 },
  label: { display: "block", margin: "17px 0 8px", color: "#d9e5ec", fontSize: "13px", fontWeight: 750 },
  input: { boxSizing: "border-box" as const, display: "block", width: "100%", minHeight: "54px", padding: "15px", border: "1px solid #345166", borderRadius: "13px", outline: "none", background: "#0a1c2a", color: "#f8fafc", fontFamily: "inherit", fontSize: "16px" },
  button: { display: "block", width: "100%", minHeight: "54px", marginTop: "24px", padding: "15px 20px", border: 0, borderRadius: "14px", background: "linear-gradient(100deg,#10b981,#34d399)", boxShadow: "0 10px 24px rgba(16,185,129,.2)", color: "#05251e", fontSize: "15px", fontWeight: 900, cursor: "pointer" },
  note: { display: "flex", gap: "10px", marginTop: "20px", padding: "13px", border: "1px solid #294357", borderRadius: "13px", background: "#0b2030", color: "#b4c5d1", fontSize: "12px", lineHeight: 1.7 },
  footer: { margin: "19px 0 0", color: "#9bb0bf", fontSize: "12px", lineHeight: 1.8, textAlign: "center" as const },
  error: { marginTop: "14px", padding: "12px 14px", border: "1px solid #7f343d", borderRadius: "12px", background: "#351a25", color: "#fecaca", fontSize: "13px" }
};

export default function DriverLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Login failed. Please try again.");
      try {
        const statusResponse = await fetch("/api/driver/verification-status", { credentials: "same-origin", cache: "no-store" });
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          if (status.status === "approved") {
            window.location.assign("/driver/instant-rides");
            return;
          }
        }
      } catch {}
      window.location.assign("/driver/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="driver-login-heading">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#f8fafc", textDecoration: "none", fontSize: 20, fontWeight: 900, marginBottom: 28 }}> <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 50, background: "#10b981", color: "#05251e" }}>↗</span> Ride<span style={{ color: "#34d399", marginLeft: -9 }}>Mitra</span></Link>
        <div style={styles.mark} aria-hidden="true">R</div>
        <p style={styles.eyebrow}>DRIVER PARTNER</p>
        <h1 id="driver-login-heading" style={styles.heading}>Welcome back, driver.</h1>
        <p style={styles.subtitle}>Sign in to your RideMitra driver account and get back on the road.</p>
        <form onSubmit={handleLogin}>
          <label style={styles.label} htmlFor="driver-email">Email address</label>
          <input style={styles.input} id="driver-email" name="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label style={styles.label} htmlFor="driver-password">Password</label>
          <input style={styles.input} id="driver-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p style={styles.error} role="alert">{error}</p>}
          <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in securely  →"}</button>
        </form>
        <div style={styles.note}><span aria-hidden="true">🔒</span><span>Your account and driver documents are protected. Never share your password or verification codes.</span></div>
        <p style={styles.footer}>New driver? Contact RideMitra support to get started.</p>
      </section>
    </main>
  );
}
