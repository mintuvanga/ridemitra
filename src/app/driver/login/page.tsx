"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { FormEvent, useState } from "react";
import styles from "./login.module.css";

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
      // Use the RideMitra app's own API so the secure session cookie
      // is issued by the same host as this page.
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Login failed. Please try again.");
      }

      // Fail closed: the dashboard is only opened if a real verification
      // endpoint explicitly confirms approval. Otherwise send the user
      // to the existing document-onboarding page.
      try {
        const statusResponse = await fetch("/api/driver/verification-status", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          if (status.status === "approved") {
            window.location.assign("/driver");
            return;
          }
        }
      } catch {
        // Verification service is not available yet; continue to onboarding.
      }

      window.location.assign("/driver/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="driver-login-heading">
        <div className={styles.brandMark} aria-hidden="true">R</div>
        <p className={styles.eyebrow}>DRIVER PARTNER</p>
        <h1 id="driver-login-heading" className={styles.heading}>Every ride moves you forward.</h1>
        <p className={styles.subtitle}>Sign in to your RideMitra driver account.</p>

        <form onSubmit={handleLogin}>
          <label className={styles.label} htmlFor="driver-email">Email address</label>
          <input
            className={styles.input}
            id="driver-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className={styles.label} htmlFor="driver-password">Password</label>
          <input
            className={styles.input}
            id="driver-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in securely"}
          </button>
        </form>

        <div className={styles.securityNote}>
          <span aria-hidden="true">🔒</span>
          <span>Your account and driver documents are protected.</span>
        </div>
        <p className={styles.footerNote}>New driver? Contact RideMitra support to get started.</p>
      </section>
    </main>
  );
}
