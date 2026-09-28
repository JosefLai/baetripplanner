"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Trip } from "@/lib/types";

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState("");

  useEffect(() => {
    void loadEverything();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void loadEverything();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadEverything() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }
    setUserEmail(user.email ?? null);

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("start_date", { ascending: true, nullsFirst: false });
    if (!error) setTrips(data as Trip[]);
  }

  async function createTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!newTripName.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("trips")
      .insert({ name: newTripName.trim(), created_by: user.id })
      .select()
      .single();

    if (!error && data) {
      // Owner is auto-visible via created_by, but adding them to
      // trip_members too keeps membership queries simple everywhere else.
      await supabase.from("trip_members").insert({ trip_id: data.id, user_id: user.id });
      setNewTripName("");
      void loadEverything();
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold">我的行程</h1>
        {userEmail && (
          <button
            onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/login"))}
            className="text-sm text-neutral-500 hover:underline"
          >
            登出({userEmail})
          </button>
        )}
      </div>

      <form onSubmit={createTrip} className="mb-8 flex gap-2">
        <input
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
          placeholder="新增行程名稱,例如「東京 2026」"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          新增
        </button>
      </form>

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
    </main>
  );
}
