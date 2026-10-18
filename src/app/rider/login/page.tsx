"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RiderLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      setOtpSent(true);
      setMessage("OTP requested. Check your phone for the SMS code.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to request OTP."
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Enter the 6-digit OTP.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      router.replace("/rider/onboarding");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "OTP verification failed."
      );
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
        <h1 className="mt-3 text-3xl font-black">
          Your journey starts here.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sign in with your mobile number. Verify your number before starting
          rider registration and document checks.
        </p>

        {!otpSent ? (
          <form onSubmit={sendOtp} className="mt-8 space-y-4">
            <label className="block text-sm font-semibold">
              Mobile number
              <div className="mt-2 flex overflow-hidden rounded-2xl border border-white/15 bg-white/5 focus-within:border-emerald-400">
                <span className="flex items-center border-r border-white/10 px-4 text-slate-300">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  className="min-w-0 flex-1 bg-transparent px-3 py-4 outline-none placeholder:text-slate-500"
                />
              </div>
            </label>

            <button
              disabled={busy}
              className="w-full rounded-2xl bg-emerald-400 px-4 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {busy ? "Requesting OTP..." : "Send OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-8 space-y-4">
            <p className="text-sm text-slate-300">
              Enter the code sent to +91 {phone}.
            </p>

            <label className="block text-sm font-semibold">
              6-digit OTP
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-2xl tracking-[0.4em] outline-none focus:border-emerald-400"
              />
            </label>

            <button
              disabled={busy}
              className="w-full rounded-2xl bg-emerald-400 px-4 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {busy ? "Verifying..." : "Verify and continue"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setMessage("");
              }}
              className="w-full py-2 text-sm text-slate-400 hover:text-white"
            >
              Change phone number
            </button>
          </form>
        )}

        {message && (
          <p role="status" className="mt-4 break-words text-sm text-emerald-300">
            {message}
          </p>
        )}

        <p className="mt-8 text-xs leading-5 text-slate-500">
          Never share your OTP with anyone. Phone verification is only the
          first step; it does not mean your rider documents are approved.
        </p>
      </div>
    </main>
  );
}
