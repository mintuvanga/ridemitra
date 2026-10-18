"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RiderLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_callback_failed") {
      setMessage("That sign-in link could not be verified or has expired. Please request a new sign-in link.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function sendMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setMessage("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/rider/onboarding`,
        },
      });

      if (error) throw error;

      setEmail(normalizedEmail);
      setSent(true);
      setMessage("A sign-in link should arrive shortly. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send sign-in link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center">
        <Link href="/" className="mb-8 text-sm text-emerald-400">
          ← RideMitra
        </Link>

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-3xl">
          🏍️
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
          Rider account
        </p>
        <h1 className="mt-3 text-3xl font-black">Your journey starts here.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sign in with your email. Open the secure sign-in link from your inbox to continue rider registration.
        </p>

        {!sent ? (
          <form onSubmit={sendMagicLink} className="mt-8 space-y-4">
            <label className="block text-sm font-semibold">
              Email address
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 outline-none placeholder:text-slate-500 focus:border-emerald-400"
              />
            </label>
            <button
              disabled={busy}
              className="w-full rounded-2xl bg-emerald-400 px-4 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {busy ? "Sending link..." : "Email me a sign-in link →"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Check your email</p>
            <p className="break-words text-sm text-slate-300">{email}</p>
            <p className="text-sm leading-6 text-slate-400">
              Open the sign-in link in the email to continue. If it does not arrive, check spam or try again later.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setMessage("");
              }}
              className="w-full py-2 text-sm text-slate-400 hover:text-white"
            >
              Use a different email
            </button>
          </div>
        )}

        {message && (
          <p role="status" className="mt-4 break-words text-sm text-emerald-300">
            {message}
          </p>
        )}

        <p className="mt-8 text-xs leading-5 text-slate-500">
          Never share your sign-in link with anyone. Email verification is only the first step; it does not mean your rider documents are approved.
        </p>
      </div>
    </main>
  );
}
