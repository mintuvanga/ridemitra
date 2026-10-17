"use client";

import Link from "next/link";

const features = [
  { icon: "🚗", title: "Find a ride", text: "Discover journeys heading your way." },
  { icon: "🧭", title: "Travel together", text: "Explore routes and plan your trip." },
  { icon: "🤝", title: "Share the journey", text: "Make everyday travel more connected." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-md bg-slate-950 pb-28">
        <header className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-black tracking-tight">
            Ride<span className="text-emerald-400">Mitra</span>
          </Link>
          <Link
            href="/trips"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Find rides
          </Link>
        </header>

        <section className="rm-page-enter px-5 pt-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-400 via-teal-700 to-slate-900 p-6 shadow-2xl shadow-emerald-950/40">
            <div className="absolute -right-10 -top-10 h-44 w-44 animate-pulse rounded-full bg-white/10 blur-2xl" />
            <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
              Better journeys start here
            </p>
            <h1 className="relative mt-4 text-4xl font-black leading-tight">
              Your journey.
              <br />
              Your people.
            </h1>
            <p className="relative mt-4 max-w-xs text-sm leading-6 text-white/85">
              Find rides, discover journeys and make travelling together easier.
            </p>
            <div className="relative my-6 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-black/15">
              <div className="absolute inset-x-0 bottom-7 h-px border-t border-dashed border-white/40" />
              <div className="animate-bounce text-7xl drop-shadow-lg">🚙</div>
              <span className="absolute bottom-2 right-3 text-xs text-white/70">
                Let's go together
              </span>
            </div>
            <Link
              href="/trips"
              className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-bold text-emerald-950 shadow-lg transition duration-200 hover:scale-[1.02] active:scale-95"
            >
              Find your next ride <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section className="px-5 pt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Made for your journey
              </p>
              <h2 className="mt-1 text-2xl font-bold">Travel smarter</h2>
            </div>
            <span className="text-2xl">✨</span>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                style={{ animationDelay: `${index * 120}ms` }}
                className="rm-card-enter flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-200 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.07]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{feature.text}</p>
                </div>
                <span className="ml-auto text-lg text-emerald-400">›</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 pt-6">
          <div className="rounded-2xl bg-slate-900 p-5">
            <p className="text-lg font-bold">Ready to hit the road?</p>
            <p className="mt-2 text-sm text-slate-400">
              Explore available journeys and find a ride that suits your plans.
            </p>
            <Link href="/trips" className="mt-4 inline-flex font-semibold text-emerald-400 hover:text-emerald-300">
              Explore journeys →
            </Link>
          </div>
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto grid max-w-md grid-cols-3 border-t border-white/10 bg-slate-950/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
          <Link href="/" className="flex flex-col items-center gap-1 py-1 text-xs font-semibold text-emerald-400">
            <span className="text-xl">⌂</span>Home
          </Link>
          <Link href="/trips" className="flex flex-col items-center gap-1 py-1 text-xs text-slate-400 transition hover:text-white">
            <span className="text-xl">⌕</span>Find rides
          </Link>
          <Link href="/bookings" className="flex flex-col items-center gap-1 py-1 text-xs text-slate-400 transition hover:text-white">
            <span className="text-xl">▤</span>Bookings
          </Link>
        </nav>
      </div>
    </main>
  );
}
