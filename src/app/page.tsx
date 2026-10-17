import Link from "next/link";

const features = [
  { icon: "🗺️", title: "Discover journeys", text: "Explore the routes and destinations you have in mind." },
  { icon: "🤝", title: "Connect with travellers", text: "Discover opportunities to coordinate journeys with others." },
  { icon: "🛡️", title: "Plan with care", text: "Keep safety and responsible travel at the centre of every plan." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-black">
            Ride<span className="text-emerald-400">Mitra</span>
          </Link>
          <nav className="hidden gap-6 text-sm text-slate-300 sm:flex">
            <a href="#how-it-works" className="hover:text-emerald-300">How it works</a>
            <a href="#features" className="hover:text-emerald-300">Features</a>
          </nav>
          <a href="#get-started" className="rounded-full bg-emerald-400 px-5 py-2.5 font-bold text-slate-950">
            Get started
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="mb-6 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Made for journeys across India 🇮🇳
          </p>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Your journey.<br />Your people.<br />
            <span className="text-emerald-400">Ride together.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            RideMitra aims to make journey discovery easier and help travellers
            explore ways to plan trips together.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#get-started" className="rounded-full bg-emerald-400 px-7 py-3.5 font-bold text-slate-950">
              Explore RideMitra →
            </a>
            <a href="#how-it-works" className="rounded-full border border-white/20 px-7 py-3.5 font-semibold">
              How it works
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            A journey-sharing idea, built one step at a time.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl md:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Your next adventure</p>
              <h2 className="mt-1 text-2xl font-bold">Where are you headed?</h2>
            </div>
            <span className="text-4xl">🚗</span>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-bold tracking-widest text-emerald-300">STARTING POINT</p>
              <p className="mt-2 text-lg font-semibold">Your starting city</p>
            </div>
            <div className="ml-8 border-l-2 border-dashed border-emerald-400/50 py-2" />
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-xs font-bold tracking-widest text-emerald-300">DESTINATION</p>
              <p className="mt-2 text-lg font-semibold">Your destination</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <p className="font-semibold text-emerald-300">Better journeys start together.</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Ride search and coordination are not enabled yet. They are planned features.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/10 bg-slate-900/50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Simple by design</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Start with a better plan.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Our goal is to help people discover journeys, connect around travel plans,
            and make informed decisions.
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold">The RideMitra vision</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-white/10 bg-slate-900 p-7">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="get-started" className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-12 text-center">
          <h2 className="text-3xl font-bold">Your journey starts here.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            This is the first version of RideMitra. Search, accounts, bookings,
            and other interactive features still need to be built and tested.
          </p>
          <p className="mt-6 font-semibold text-emerald-300">RideMitra — journeys are better together.</p>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-7 text-center text-sm text-slate-500">
        © 2026 RideMitra. Built for journeys across India.
      </footer>
    </main>
  );
}

