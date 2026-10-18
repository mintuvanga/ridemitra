"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RiderOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          router.replace("/rider/login");
          return;
        }

        setEmail(data.user.email ?? "");
      } catch {
        router.replace("/rider/login");
      } finally {
        setLoading(false);
      }
    }

    void checkSession();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking your session...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-emerald-400">
          ← RideMitra
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-4xl">🛡️</div>
          <h1 className="mt-4 text-2xl font-black">Rider registration</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your email login is complete. Next, we will build your profile
            and secure document verification.
          </p>

          <div className="mt-6 rounded-2xl bg-emerald-400/10 p-4">
            <p className="text-xs text-slate-400">Signed-in email</p>
            <p className="mt-1 break-words font-semibold">{email || "Verified email account"}</p>
          </div>

          <div className="mt-5 space-y-3">
            {["Rider profile", "Driving licence", "Bike RC", "Identity and facial checks"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/10 p-3"
              >
                <span className="text-emerald-400">○</span>
                <span className="text-sm">{item}</span>
                <span className="ml-auto text-xs text-slate-500">Next step</span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-amber-200">
            Registration is not yet approved. We will add the actual verification
            process before enabling rider trip publishing.
          </p>

          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.replace("/rider/login");
            }}
            className="mt-6 w-full rounded-xl border border-white/15 py-3 text-sm font-semibold hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
