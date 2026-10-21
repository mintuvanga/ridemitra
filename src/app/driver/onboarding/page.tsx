"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type VehicleType = "motorcycle" | "auto" | "car";
type Application = { vehicle_type: VehicleType; registration_number: string; vehicle_make: string; vehicle_model: string; vehicle_color: string | null; city: string };
type DocumentStatus = { document_type: string; status: string };
type ApiData = { application: Application | null; verification: { status: string; rejection_reason: string | null }; documents: DocumentStatus[] };

const vehicleOptions: { value: VehicleType; label: string; hint: string; icon: string }[] = [
  { value: "motorcycle", label: "Bike", hint: "Two-wheeler rides", icon: "🏍️" },
  { value: "auto", label: "Auto", hint: "Auto-rickshaw rides", icon: "🛺" },
  { value: "car", label: "Cab", hint: "Car rides", icon: "🚗" },
];
const docLabels: Record<string, string> = { licence: "Driving licence", rc: "Vehicle RC", insurance: "Insurance", selfie: "Selfie" };

export default function DriverOnboardingPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("motorcycle");
  const [registration, setRegistration] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [verification, setVerification] = useState("loading");
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/driver/onboarding", { cache: "no-store" });
        const data = await response.json() as ApiData & { error?: string };
        if (response.status === 401) { if (!cancelled) setSignedOut(true); return; }
        if (!response.ok) throw new Error(data.error || "Unable to load onboarding.");
        if (cancelled) return;
        if (data.application) {
          setVehicleType(data.application.vehicle_type);
          setRegistration(data.application.registration_number || "");
          setMake(data.application.vehicle_make || "");
          setModel(data.application.vehicle_model || "");
          setColor(data.application.vehicle_color || "");
          setCity(data.application.city || "Hyderabad");
        }
        setVerification(data.verification?.status || "not_submitted");
        setReason(data.verification?.rejection_reason || "");
        setDocuments(data.documents || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load onboarding.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/driver/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_type: vehicleType, registration_number: registration, vehicle_make: make, vehicle_model: model, vehicle_color: color, city }),
      });
      const data = await response.json();
      if (response.status === 401) { setSignedOut(true); throw new Error("Your session has expired. Please sign in again."); }
      if (!response.ok) throw new Error(data.error || "Could not save vehicle details.");
      setSuccess(data.message || "Vehicle details saved.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save vehicle details."); }
    finally { setSaving(false); }
  }

  const locked = verification === "pending" || verification === "approved";
  const labelStatus = verification === "approved" ? "Approved" : verification === "pending" ? "Under review" : verification === "rejected" ? "Changes requested" : verification === "loading" ? "Loading…" : "Not submitted";

  if (signedOut) return <main className="grid min-h-screen place-items-center bg-gradient-to-b from-sky-50 to-white p-5 text-slate-900"><section className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-7 text-center shadow-xl"><div className="text-4xl">🔐</div><h1 className="mt-3 text-2xl font-black">Sign in to continue</h1><p className="mt-2 text-sm text-slate-600">Driver onboarding is saved to your private account.</p><Link href="/driver/login" className="mt-5 inline-flex rounded-xl bg-sky-600 px-5 py-3 font-extrabold text-white">Driver sign in</Link></section></main>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-3 py-4 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 shadow-sm sm:px-5">
          <Link href="/driver" className="text-xl font-black tracking-tight">Ride<span className="text-sky-600">Mitra</span></Link>
          <Link href="/driver" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold hover:bg-slate-50">← Driver dashboard</Link>
        </header>

        <div className="mb-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-5 text-white shadow-lg sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-sky-100">Driver application</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Vehicle registration</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-sky-50 sm:text-base">Save your vehicle details, then upload the required documents for manual verification.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-bold"><span className="h-2 w-2 rounded-full bg-white" />{labelStatus}</div>
        </div>

        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading your saved application…</div> : <>
          {verification === "rejected" && reason && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><strong>Review feedback:</strong> {reason}</div>}
          <form onSubmit={save} className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div><h2 className="text-xl font-black">1. Choose your vehicle</h2><p className="mt-1 text-sm text-slate-500">Choose the type you will use for RideMitra trips.</p></div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {vehicleOptions.map(option => <button key={option.value} type="button" disabled={locked} onClick={() => setVehicleType(option.value)} aria-pressed={vehicleType === option.value} className={"rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70 " + (vehicleType === option.value ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-slate-200 hover:border-sky-200")}><span className="text-3xl">{option.icon}</span><span className="mt-2 block font-black">{option.label}</span><span className="mt-1 block text-xs text-slate-500">{option.hint}</span></button>)}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-slate-700">Registration number<input required disabled={locked} minLength={4} maxLength={20} value={registration} onChange={e => setRegistration(e.target.value.toUpperCase())} placeholder="e.g. TS 09 AB 1234" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100" /></label>
                <label className="block text-sm font-bold text-slate-700">Vehicle make / brand<input required disabled={locked} minLength={2} maxLength={60} value={make} onChange={e => setMake(e.target.value)} placeholder="e.g. Honda, Maruti" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100" /></label>
                <label className="block text-sm font-bold text-slate-700">Model<input required disabled={locked} maxLength={60} value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. Activa, Swift" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100" /></label>
                <label className="block text-sm font-bold text-slate-700">Colour (optional)<input disabled={locked} maxLength={40} value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. White" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100" /></label>
                <label className="block text-sm font-bold text-slate-700 sm:col-span-2">Operating city<input required disabled={locked} minLength={2} maxLength={80} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Hyderabad" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100" /></label>
              </div>
              {locked ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Your application is {verification === "approved" ? "approved" : "under review"}, so these details are locked. Contact support if they need to change.</p> : <button disabled={saving} type="submit" className="mt-5 w-full rounded-xl bg-sky-600 px-5 py-3.5 font-black text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 sm:w-auto">{saving ? "Saving…" : "Save vehicle details"}</button>}
            </section>
          </form>

          <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-xl">📄</span><div><h2 className="text-xl font-black">2. Documents & verification</h2><p className="mt-1 text-sm leading-6 text-slate-500">Your details are saved, but approval requires a driving licence, vehicle RC, current insurance, and a selfie. A real document upload needs private storage to be configured.</p></div></div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{["licence","rc","insurance","selfie"].map(type => { const doc = documents.find(d => d.document_type === type); return <div key={type} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm"><span className="font-bold">{docLabels[type]}</span><span className={"rounded-full px-2.5 py-1 text-xs font-extrabold " + (doc?.status === "approved" ? "bg-emerald-100 text-emerald-800" : doc?.status === "pending" ? "bg-amber-100 text-amber-800" : doc?.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-600")}>{doc?.status || "Not uploaded"}</span></div>; })}</div>
            <Link href="/driver/documents" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3.5 font-extrabold text-white hover:bg-slate-800 sm:w-auto">Continue to document upload →</Link>
            <p className="mt-3 text-xs leading-5 text-slate-500">Saving vehicle details does not submit your verification or enable online mode. Approval happens only after document submission and manual review.</p>
          </section>
          {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}
          {success && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{success}</p>}
        </>}
        <footer className="py-7 text-center text-xs text-slate-500">RideMitra · Driver onboarding · Keep your documents private and up to date.</footer>
      </div>
    </main>
  );
}
