"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"signup" | "verify">("signup");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(stage === "signup" ? "/api/auth/signup" : "/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stage === "signup"
          ? { name, email: email.trim().toLowerCase(), password }
          : { email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to continue.");
      if (stage === "signup") {
        setStage("verify");
        setMessage(result.message || "Check your email for the six-digit verification code.");
      } else {
        window.location.href = "/trips";
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="text-sm font-semibold text-blue-700">← RideMitra</Link>
      <h1 className="mt-8 text-3xl font-bold">{stage === "signup" ? "Create your account" : "Verify your email"}</h1>
      <p className="mt-2 text-sm text-slate-600">{stage === "signup" ? "Create a RideMitra account to find and publish journeys." : "Enter the six-digit code sent to " + email + "."}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {stage === "signup" ? (
          <>
            <input required maxLength={100} autoComplete="name" placeholder="Full name" className="w-full rounded-lg border p-3" value={name} onChange={e => setName(e.target.value)} />
            <input required type="email" autoComplete="email" placeholder="Email address" className="w-full rounded-lg border p-3" value={email} onChange={e => setEmail(e.target.value)} />
            <input required type="password" minLength={8} maxLength={128} autoComplete="new-password" placeholder="Password (8 characters minimum)" className="w-full rounded-lg border p-3" value={password} onChange={e => setPassword(e.target.value)} />
          </>
        ) : (
          <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit email code" className="w-full rounded-lg border p-3 text-center text-xl tracking-[0.4em]" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        )}
        <button disabled={busy} className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">
          {busy ? "Please wait..." : stage === "signup" ? "Create account and send code" : "Verify email and continue"}
        </button>
      </form>
      {message && <p role="status" className="mt-4 break-words text-sm">{message}</p>}
      {stage === "verify" && <button type="button" onClick={() => { setStage("signup"); setCode(""); setMessage(""); }} className="mt-3 text-sm text-blue-700">Back to account details</button>}
      <p className="mt-5 text-sm">Already have an account? <Link href="/login" className="text-blue-700">Sign in</Link></p>
    </main>
  );
}
