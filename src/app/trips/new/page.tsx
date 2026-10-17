import Link from "next/link";

export default function NewTripPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/trips" className="text-blue-700">← Find journeys</Link>
      <h1 className="mt-8 text-3xl font-bold">Publish a journey</h1>
      <p className="mt-3 text-gray-600">Journey publishing will be connected next.</p>
      <Link href="/login" className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 text-white">Sign in</Link>
    </main>
  );
}
