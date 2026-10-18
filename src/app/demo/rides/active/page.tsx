"use client";

const pickup = "Ameerpet Metro Station, Ameerpet, Hyderabad";
const destination = "HITEC City, Mindspace, Hyderabad";
const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

export default function ActiveDemoRidePage() {
  function openMaps() {
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-8 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 text-center shadow-lg shadow-sky-100 sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl" aria-hidden="true">📍</div>
        <h1 className="mt-4 text-2xl font-black">Ride accepted</h1>
        <p className="mt-2 text-sm text-slate-500">Tap below to start navigation in Google Maps.</p>

        <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pickup</p>
          <p className="mt-1 font-bold">{pickup}</p>
          <div className="my-3 border-t border-sky-200" />
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Destination</p>
          <p className="mt-1 font-bold">{destination}</p>
        </div>

        <button type="button" onClick={openMaps} className="mt-6 w-full rounded-xl bg-sky-600 px-5 py-4 font-extrabold text-white transition hover:bg-sky-700">
          ↗ Go to Google Maps
        </button>
        <p className="mt-3 text-xs text-slate-500">Google Maps opens in a new tab. Return here when you need to.</p>
        <p className="mt-5 text-xs text-amber-800">Demo only: sample locations; live trip details are not connected.</p>
      </section>
    </main>
  );
}
