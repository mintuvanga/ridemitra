import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <Link href="/" className="text-blue-700">← RideMitra</Link>
      <h1 className="mt-8 text-3xl font-bold">Sign in</h1>
      <p className="mt-3 text-gray-600">Your RideMitra account page is being prepared.</p>
      <Link href="/signup" className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 text-white">Create account</Link>
    </main>
  );
}
