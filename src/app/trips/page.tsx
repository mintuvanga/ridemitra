import Link from "next/link";

export default function TripsPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link href="/" className="text-blue-700">← RideMitra home</Link>
      <h1 className="mt-8 text-3xl font-bold">Find a journey</h1>
      <p className="mt-3 text-gray-600">Journey search is being prepared.</p>
      <Link href="/trips/new" className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 text-white">Publish a journey</Link>
    </main>
  );
}
