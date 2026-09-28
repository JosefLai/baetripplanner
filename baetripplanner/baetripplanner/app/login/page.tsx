"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-semibold">BaeTripPlanner</h1>
      <p className="mb-6 text-sm text-neutral-500">
        輸入 Email,我們會寄一個登入連結給你(不用密碼)。
      </p>

      {sent ? (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          登入連結已寄出,去信箱點連結完成登入。
        </p>
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
            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            寄送登入連結
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </main>
  );
}
