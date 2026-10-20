"use client";

import { FormEvent, useState } from "react";

const styles = {
  page: { minHeight: "100vh", boxSizing: "border-box" as const, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 18px", background: "radial-gradient(circle at 12% 15%, #bae6fd 0, transparent 32%), radial-gradient(circle at 90% 85%, #dbeafe 0, transparent 35%), linear-gradient(135deg, #f0f9ff 0%, #ffffff 52%, #e0f2fe 100%)", color: "#0f2742", fontFamily: "Inter, Arial, sans-serif" },
  card: { boxSizing: "border-box" as const, width: "100%", maxWidth: "460px", padding: "clamp(24px, 6vw, 42px)", border: "1px solid #bae6fd", borderRadius: "28px", background: "#ffffff", boxShadow: "0 28px 80px rgba(2,132,199,.15)" },
  mark: { display: "grid", placeItems: "center", width: "62px", height: "62px", marginBottom: "24px", borderRadius: "19px", background: "linear-gradient(145deg,#38bdf8,#0369a1)", boxShadow: "0 10px 24px rgba(2,132,199,.28)", color: "#fff", fontSize: "32px", fontWeight: 900 },
  eyebrow: { margin: "0 0 10px", color: "#0284c7", fontSize: "12px", fontWeight: 800, letterSpacing: "2.5px" },
  heading: { margin: "0 0 12px", fontSize: "clamp(28px, 5vw, 38px)", lineHeight: 1.13, letterSpacing: "-1px", fontWeight: 850, color: "#0f2742" },
  subtitle: { margin: "0 0 28px", color: "#64748b", fontSize: "15px", lineHeight: 1.65 },
  label: { display: "block", margin: "18px 0 8px", color: "#334155", fontSize: "13px", fontWeight: 750 },
  input: { boxSizing: "border-box" as const, display: "block", width: "100%", minHeight: "52px", padding: "14px 15px", border: "1px solid #cbddea", borderRadius: "12px", outline: "none", background: "#f8fcff", color: "#0f2742", fontFamily: "inherit", fontSize: "15px" },
  button: { display: "block", width: "100%", minHeight: "54px", marginTop: "26px", padding: "15px 20px", border: 0, borderRadius: "13px", background: "linear-gradient(100deg,#0284c7,#0369a1)", boxShadow: "0 10px 22px rgba(2,132,199,.22)", color: "#fff", fontSize: "15px", fontWeight: 800, cursor: "pointer" },
  note: { display: "flex", gap: "10px", marginTop: "24px", padding: "14px", border: "1px solid #dbeafe", borderRadius: "13px", background: "#f0f9ff", color: "#475569", fontSize: "12px", lineHeight: 1.7 },
  footer: { margin: "20px 0 0", color: "#64748b", fontSize: "12px", lineHeight: 1.8, textAlign: "center" as const },
  error: { marginTop: "14px", padding: "12px 14px", border: "1px solid #fecaca", borderRadius: "12px", background: "#fef2f2", color: "#b91c1c", fontSize: "13px" }
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
            window.location.assign("/driver");
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
        <div style={styles.mark} aria-hidden="true">R</div>
        <p style={styles.eyebrow}>DRIVER PARTNER</p>
        <h1 id="driver-login-heading" style={styles.heading}>Every ride moves you forward.</h1>
        <p style={styles.subtitle}>Sign in to your RideMitra driver account.</p>
        <form onSubmit={handleLogin}>
          <label style={styles.label} htmlFor="driver-email">Email address</label>
          <input style={styles.input} id="driver-email" name="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label style={styles.label} htmlFor="driver-password">Password</label>
          <input style={styles.input} id="driver-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p style={styles.error} role="alert">{error}</p>}
          <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in securely"}</button>
        </form>
        <div style={styles.note}><span aria-hidden="true">🔒</span><span>Your account and driver documents are protected.</span></div>
        <p style={styles.footer}>New driver? Contact RideMitra support to get started.</p>
      </section>
    </main>
  );
}
