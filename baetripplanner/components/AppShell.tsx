"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

const TABS = [{ href: "/", label: "我的行程" }];

/**
 * Persistent top nav — every authenticated page renders inside this.
 * Without it there was no way to get back to the trip list or see what
 * else the app could do, which is the "can't see other functions" complaint.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">BaeTripPlanner</span>
            <nav className="flex gap-4 text-sm">
              {TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    pathname === tab.href
                      ? "font-medium text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900"
                  }
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
          {user && (
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <span className="hidden sm:inline">{user.email}</span>
              <button onClick={handleSignOut} className="hover:text-neutral-900 hover:underline">
                登出
              </button>
            </div>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
