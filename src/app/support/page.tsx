import Link from "next/link";

export default function DriverSupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-lg">
        <Link href="/driver/documents" className="text-sm font-bold text-sky-700">← Back to document verification</Link>
        <section className="mt-6 rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100/60 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">💬</div>
          <h1 className="mt-5 text-3xl font-black">Driver support centre</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Need help with your driving licence, RC, insurance, or selfie check? We can add a verified support email or helpdesk after the RideMitra support contact is provided.</p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Support contact not configured.</strong> No unverified phone number or email is shown here. Document submission remains disabled until secure verification is ready.</div>
          <Link href="/" className="mt-6 flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 font-bold text-white hover:bg-sky-700">Return to driver login</Link>
        </section>
      </div>
    </main>
  );
}
