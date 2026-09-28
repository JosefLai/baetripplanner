"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Once AuthProvider resolves a session (including finishing a magic-link
  // exchange from the URL), leave the login page automatically.
  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setSubmitting(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (loading) {
    return <main className="p-10 text-center text-sm text-neutral-400">載入中…</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-semibold">BaeTripPlanner</h1>
      <p className="mb-6 text-sm text-neutral-500">
        輸入 Email,我們會寄一個登入連結給你(不用密碼)。
      </p>

      {sent ? (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <p>登入連結已寄出,去信箱點連結完成登入。</p>
          <button
            onClick={() => setSent(false)}
            className="mt-2 text-xs text-green-800 underline"
          >
            用別的 Email 重新寄送
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {submitting ? "寄送中…" : "寄送登入連結"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </main>
  );
}
