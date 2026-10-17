import Link from "next/link";

const features = [
  { icon: "🗺️", title: "Discover journeys", text: "Explore routes and destinations across India." },
  { icon: "🤝", title: "Travel together", text: "Connect with travellers planning similar journeys." },
  { icon: "🛡️", title: "Plan with care", text: "Keep safety and responsible travel in mind." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="relative z-10 border-b border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-black">
            Ride<span className="text-emerald-400">Mitra</span>
          </Link>
          <nav className="hidden gap-6 text-sm text-white/80 sm:flex">
            <a href="#how-it-works" className="hover:text-emerald-300">How it works</a>
            <a href="#features" className="hover:text-emerald-300">Features</a>
          </nav>
          <Link href="/trips" className="rounded-full bg-emerald-400 px-5 py-2.5 font-bold text-slate-950 hover:bg-emerald-300">
            Find a ride →
          </Link>
        </div>
      </header>

      <section
        className="relative isolate overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(2,6,23,0.94) 0%, rgba(2,6,23,0.76) 48%, rgba(2,6,23,0.35) 100%), url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=85')"
        }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20" />
        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-6 inline-block rounded-full border border-emerald-300/40 bg-black/30 px-4 py-2 text-sm text-emerald-200 backdrop-blur">
              ✦ Made for journeys across India
            </p>
            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl">
              The road is better
              <span className="block text-emerald-400">together.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-200">
              Discover journeys, find fellow travellers and make your next road trip more connected with RideMitra.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/trips" className="rounded-full bg-emerald-400 px-7 py-4 font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-300">
                Explore journeys →
              </Link>
              <Link href="/trips/new" className="rounded-full border border-white/40 bg-white/10 px-7 py-4 font-semibold backdrop-blur transition hover:bg-white/20">
                Publish a journey
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
              <span>✦ Discover routes</span>
              <span>✦ Share travel plans</span>
              <span>✦ Explore India</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-3xl">🚘</div>
              <div>
                <p className="text-sm text-emerald-300">YOUR NEXT ADVENTURE</p>
                <h2 className="mt-1 text-2xl font-bold">Where are you headed?</h2>
              </div>
            </div>
            <div className="mt-7 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold tracking-widest text-emerald-300">STARTING POINT</p>
                <p className="mt-2 text-lg font-semibold">Choose your city</p>
              </div>
              <div className="ml-8 border-l-2 border-dashed border-emerald-400/60 py-2" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold tracking-widest text-emerald-300">DESTINATION</p>
                <p className="mt-2 text-lg font-semibold">Choose where to go</p>
              </div>
            </div>
            <Link href="/trips" className="mt-6 block rounded-xl bg-emerald-400 p-4 text-center font-bold text-slate-950 transition hover:bg-emerald-300">
              Find available journeys →
            </Link>
            <p className="mt-4 text-center text-xs leading-5 text-slate-300">
              Search available journeys and explore your options.
            </p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-transparent" />
      </section>

      <section id="how-it-works" className="border-b border-white/10 bg-slate-900 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Your journey begins here</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Less planning stress. More road-trip spirit.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Find journeys shared by travellers, explore routes and publish your own planned trip.
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Why RideMitra</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Made for the journey.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-7 transition hover:border-emerald-400/50">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-3xl">{feature.icon}</span>
              <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="get-started" className="px-6 pb-20">
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-emerald-300/30 bg-cover bg-center px-6 py-14 text-center"
          style={{
            backgroundImage: "linear-gradient(rgba(2,6,23,0.82), rgba(2,6,23,0.92)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80')"
          }}
        >
          <p className="font-bold uppercase tracking-widest text-emerald-300">Your next chapter</p>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">Every road leads to a story.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-200">
            Start exploring journeys or share your travel plans with RideMitra.
          </p>
          <Link href="/trips" className="mt-7 inline-block rounded-full bg-emerald-400 px-8 py-4 font-bold text-slate-950 hover:bg-emerald-300">
            Start exploring →
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-7 text-center text-sm text-slate-400">
        © 2026 RideMitra · Journeys are better together.
      </footer>
    </main>
  );
}
