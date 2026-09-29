"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";
import { AppShell } from "@/components/AppShell";
import type { Trip } from "@/lib/types";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [newTripName, setNewTripName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) void loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function loadTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("start_date", { ascending: true, nullsFirst: false });
    if (error) {
      setError(`讀取行程失敗:${error.message}`);
      return;
    }
    setError(null);
    setTrips(data as Trip[]);
  }

  async function createTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!newTripName.trim() || !user) return;
    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("trips")
      .insert({ name: newTripName.trim(), created_by: user.id })
      .select()
      .single();

    if (error) {
      setError(`新增行程失敗:${error.message}`);
      setCreating(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("trip_members")
      .insert({ trip_id: data.id, user_id: user.id });
    if (memberError) {
      setError(`新增行程成員失敗:${memberError.message}`);
      setCreating(false);
      return;
    }

    setNewTripName("");
    setCreating(false);
    void loadTrips();
  }

  if (authLoading || !user) {
    return <main className="p-10 text-center text-sm text-neutral-400">載入中…</main>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-xl font-semibold">我的行程</h1>

        <form onSubmit={createTrip} className="mb-3 flex gap-2">
          <input
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
            placeholder="新增行程名稱,例如「東京 2026」"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {creating ? "新增中…" : "新增"}
          </button>
        </form>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {trips === null && <p className="text-sm text-neutral-400">載入中…</p>}
        {trips?.length === 0 && (
          <p className="text-sm text-neutral-400">還沒有行程,上面新增一個吧。</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trips?.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md"
            >
              <div className="h-28 w-full bg-neutral-100">
                {trip.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={trip.cover_image_url}
                    alt={trip.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium">{trip.name}</p>
                {trip.start_date && (
                  <p className="text-xs text-neutral-500">
                    {trip.start_date} — {trip.end_date}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
