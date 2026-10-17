"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (error) throw error;

      setMessage(
        data.session
          ? "Account created successfully."
          : "Account created. Check your email to confirm your account."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link href="/" className="text-sm font-semibold text-blue-700">← RideMitra</Link>
      <h1 className="mt-8 text-3xl font-bold">Create your account</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input required maxLength={100} autoComplete="name" placeholder="Full name" className="w-full rounded-lg border p-3" value={name} onChange={e => setName(e.target.value)} />
        <input required type="email" autoComplete="email" placeholder="Email address" className="w-full rounded-lg border p-3" value={email} onChange={e => setEmail(e.target.value)} />
        <input required type="password" minLength={8} autoComplete="new-password" placeholder="Password (8 characters minimum)" className="w-full rounded-lg border p-3" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={busy} className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">
          {busy ? "Creating account..." : "Sign up"}
        </button>
      </form>
      {message && <p role="status" className="mt-4 break-words text-sm">{message}</p>}
      <p className="mt-5 text-sm">Already have an account? <Link href="/login" className="text-blue-700">Sign in</Link></p>
    </main>
  );
}
