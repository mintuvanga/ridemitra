"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Profile = { id: string; email: string; full_name: string; home_city: string | null; avatar_url?: string | null };

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const hasChanges = !!profile && (name.trim() !== profile.full_name || city.trim() !== (profile.home_city || ""));

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/driver/profile", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) { setSignedOut(true); setProfile(null); return; }
      if (!response.ok) throw new Error(data.error || "Could not load profile.");
      setSignedOut(false);
      setProfile(data.profile);
      setName(data.profile.full_name || "");
      setCity(data.profile.home_city || "");
      setSuccess("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load profile.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadProfile(); }, []);

  function resetChanges() {
    setName(profile?.full_name || "");
    setCity(profile?.home_city || "");
    setError("");
    setSuccess("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasChanges) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/driver/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name.trim().replace(/\s+/g, " "), home_city: city.trim().replace(/\s+/g, " ") }),
      });
      const data = await response.json();
      if (response.status === 401) { setSignedOut(true); throw new Error("Your session has expired. Please sign in again."); }
      if (!response.ok) throw new Error(data.error || "Could not save profile.");
      setProfile(data.profile);
      setName(data.profile.full_name || "");
      setCity(data.profile.home_city || "");
      setSuccess("Your profile has been saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-[#071827] px-3 pb-28 pt-4 text-slate-100 sm:px-6 sm:py-8 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/driver" className="text-xl font-black tracking-tight">Ride<span className="text-emerald-300">Mitra</span></Link>
          <Link href="/driver" className="rounded-xl border border-slate-600 bg-[#0b2234] px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-950/40">← Driver dashboard</Link>
        </header>
        <section className="mt-8 rounded-3xl border border-slate-700 bg-[#0b2234] p-6 shadow-lg shadow-black/10 sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-300">Account settings</p>
          <h1 className="mt-2 text-3xl font-black">Driver profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Update your personal details. Your email address is shown for reference and cannot be changed here.</p>
          {signedOut ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-extrabold">Sign in required</h2>
              <p className="mt-1 text-sm text-slate-300">Your profile is private to your account.</p>
              <Link href="/driver/login" className="mt-4 inline-flex rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-white">Go to login →</Link>
            </div>
          ) : loading ? <p className="mt-8 text-sm text-slate-400">Loading your profile…</p> : (
            <form onSubmit={save} className="mt-7 space-y-5">
              <div>
                <label htmlFor="profile-email" className="mb-2 block text-sm font-bold text-slate-200">Email address</label>
                <input id="profile-email" value={profile?.email || ""} readOnly className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-slate-400 outline-none" />
              </div>
              <div>
                <label htmlFor="profile-name" className="mb-2 block text-sm font-bold text-slate-200">Full name</label>
                <input id="profile-name" value={name} onChange={(e) => { setName(e.target.value); setSuccess(""); }} minLength={2} maxLength={80} required autoComplete="name" className="w-full rounded-xl border border-slate-700 px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-900" placeholder="Enter your full name" />
              </div>
              <div>
                <label htmlFor="profile-city" className="mb-2 block text-sm font-bold text-slate-200">Home city <span className="font-normal text-slate-400">(optional)</span></label>
                <input id="profile-city" value={city} onChange={(e) => { setCity(e.target.value); setSuccess(""); }} maxLength={80} autoComplete="address-level2" className="w-full rounded-xl border border-slate-700 px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-900" placeholder="e.g. Hyderabad" />
              </div>
              {hasChanges && <p className="rounded-xl border border-slate-700 bg-emerald-950/40 p-3 text-sm text-emerald-200">You have unsaved profile changes.</p>}
              {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
              {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={saving || !hasChanges} className="flex-1 rounded-xl bg-emerald-500 px-5 py-3.5 font-extrabold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button>
                <button type="button" onClick={resetChanges} disabled={saving || !hasChanges} className="rounded-xl border border-slate-600 px-5 py-3.5 font-bold text-emerald-300 transition hover:bg-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-50">Discard changes</button>
              </div>
            </form>
          )}
          {!signedOut && error && !loading && <button onClick={() => void loadProfile()} className="mt-4 text-sm font-bold text-emerald-300 underline">Retry loading</button>}
        </section>
      </div>

      <nav aria-label="Driver navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-700 bg-[#071827]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {[{ label: "Home", icon: "⌂", href: "/driver/instant-rides" }, { label: "New rides", icon: "◉", href: "/driver/new-ride-requests" }, { label: "Earnings", icon: "₹", href: "/driver/earnings" }, { label: "More", icon: "☰", href: "/driver/instant-rides" }].map(item => (
            <Link key={item.label} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-emerald-300">
              <span className="text-lg leading-none">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
