"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Attachment, Item, Trip } from "@/lib/types";
import { CoverImageUpload } from "@/components/CoverImageUpload";
import { ItemsTable } from "@/components/ItemsTable";
import { ItemsCards } from "@/components/ItemsCards";
import { AttachmentUploader } from "@/components/AttachmentUploader";

type View = "table" | "cards";

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tripAttachments, setTripAttachments] = useState<Attachment[]>([]);
  const [itemAttachments, setItemAttachments] = useState<Attachment[]>([]);
  const [view, setView] = useState<View>("table");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function load() {
    const [{ data: tripData }, { data: itemData }, { data: attData }] = await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).single(),
      supabase.from("items").select("*").eq("trip_id", tripId).order("sort_order"),
      supabase.from("attachments").select("*").or(`trip_id.eq.${tripId}`),
    ]);
    setTrip(tripData as Trip);
    setItems((itemData as Item[]) ?? []);

    const itemIds = ((itemData as Item[]) ?? []).map((i) => i.id);
    setTripAttachments(((attData as Attachment[]) ?? []).filter((a) => a.trip_id === tripId));

    if (itemIds.length > 0) {
      const { data: itemAtt } = await supabase
        .from("attachments")
        .select("*")
        .in("item_id", itemIds);
      setItemAttachments((itemAtt as Attachment[]) ?? []);
    } else {
      setItemAttachments([]);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await supabase.from("items").insert({
      trip_id: tripId,
      title: newTitle.trim(),
      sort_order: items.length,
    });
    setNewTitle("");
    void load();
  }

  const attachmentsByItem: Record<string, Attachment[]> = {};
  for (const a of itemAttachments) {
    if (!a.item_id) continue;
    (attachmentsByItem[a.item_id] ??= []).push(a);
  }

  const totalBudget = items.reduce((sum, i) => sum + (i.budget_amount ?? 0), 0);

  if (!trip) return <main className="p-10 text-sm text-neutral-400">載入中…</main>;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="mb-4 inline-block text-sm text-neutral-500 hover:underline">
        ← 所有行程
      </Link>

      <div className="mb-6">
        <CoverImageUpload
          tripId={tripId}
          currentUrl={trip.cover_image_url}
          onChange={(url) => setTrip({ ...trip, cover_image_url: url })}
        />
      </div>

      <h1 className="mb-1 text-2xl font-semibold">{trip.name}</h1>
      {(trip.start_date || trip.end_date) && (
        <p className="mb-4 text-sm text-neutral-500">
          {trip.start_date} — {trip.end_date}
        </p>
      )}

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-neutral-600">行程附件(機票、訂房等)</p>
        <AttachmentUploader tripId={tripId} attachments={tripAttachments} onChange={load} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex rounded-lg border border-neutral-200 p-0.5 text-sm">
          <button
            onClick={() => setView("table")}
            className={`rounded-md px-3 py-1 ${view === "table" ? "bg-neutral-900 text-white" : "text-neutral-600"}`}
          >
            表格檢視
          </button>
          <button
            onClick={() => setView("cards")}
            className={`rounded-md px-3 py-1 ${view === "cards" ? "bg-neutral-900 text-white" : "text-neutral-600"}`}
          >
            卡片檢視
          </button>
        </div>
        <p className="text-sm font-medium">預算總計:CAD {totalBudget.toFixed(2)}</p>
      </div>

      <form onSubmit={addItem} className="mb-4 flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新增項目,例如「清水寺」"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          新增
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">還沒有項目,上面新增一個吧。</p>
      ) : view === "table" ? (
        <ItemsTable items={items} onChange={load} />
      ) : (
        <ItemsCards items={items} attachmentsByItem={attachmentsByItem} onChange={load} />
      )}
    </main>
  );
}
