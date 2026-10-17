import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <Link href="/" className="text-blue-700">← RideMitra</Link>
      <h1 className="mt-8 text-3xl font-bold">Create your account</h1>
      <p className="mt-3 text-gray-600">Account registration will be connected next.</p>
      <Link href="/login" className="mt-6 inline-block text-blue-700">Already registered? Sign in</Link>
    </main>
  );
}
