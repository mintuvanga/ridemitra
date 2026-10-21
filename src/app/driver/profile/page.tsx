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
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/driver" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span></Link>
          <Link href="/driver" className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50">← Driver dashboard</Link>
        </header>
        <section className="mt-8 rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">Account settings</p>
          <h1 className="mt-2 text-3xl font-black">Driver profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Update your personal details. Your email address is shown for reference and cannot be changed here.</p>
          {signedOut ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-extrabold">Sign in required</h2>
              <p className="mt-1 text-sm text-slate-600">Your profile is private to your account.</p>
              <Link href="/driver/login" className="mt-4 inline-flex rounded-xl bg-sky-600 px-4 py-2.5 font-bold text-white">Go to login →</Link>
            </div>
          ) : loading ? <p className="mt-8 text-sm text-slate-500">Loading your profile…</p> : (
            <form onSubmit={save} className="mt-7 space-y-5">
              <div>
                <label htmlFor="profile-email" className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
                <input id="profile-email" value={profile?.email || ""} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none" />
              </div>
              <div>
                <label htmlFor="profile-name" className="mb-2 block text-sm font-bold text-slate-700">Full name</label>
                <input id="profile-name" value={name} onChange={(e) => { setName(e.target.value); setSuccess(""); }} minLength={2} maxLength={80} required autoComplete="name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="Enter your full name" />
              </div>
              <div>
                <label htmlFor="profile-city" className="mb-2 block text-sm font-bold text-slate-700">Home city <span className="font-normal text-slate-400">(optional)</span></label>
                <input id="profile-city" value={city} onChange={(e) => { setCity(e.target.value); setSuccess(""); }} maxLength={80} autoComplete="address-level2" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="e.g. Hyderabad" />
              </div>
              {hasChanges && <p className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-800">You have unsaved profile changes.</p>}
              {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
              {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={saving || !hasChanges} className="flex-1 rounded-xl bg-sky-600 px-5 py-3.5 font-extrabold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button>
                <button type="button" onClick={resetChanges} disabled={saving || !hasChanges} className="rounded-xl border border-sky-200 px-5 py-3.5 font-bold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50">Discard changes</button>
              </div>
            </form>
          )}
          {!signedOut && error && !loading && <button onClick={() => void loadProfile()} className="mt-4 text-sm font-bold text-sky-700 underline">Retry loading</button>}
        </section>
      </div>
    </main>
  );
}
