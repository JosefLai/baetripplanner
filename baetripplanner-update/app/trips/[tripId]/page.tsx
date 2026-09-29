"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";
import { AppShell } from "@/components/AppShell";
import type { Attachment, Item, Trip } from "@/lib/types";
import { CoverImageUpload } from "@/components/CoverImageUpload";
import { ItemsTable } from "@/components/ItemsTable";
import { ItemsCards } from "@/components/ItemsCards";
import { AttachmentUploader } from "@/components/AttachmentUploader";
import { DayTabs } from "@/components/DayTabs";
import { ItemDetailModal } from "@/components/ItemDetailModal";

type View = "table" | "cards";
type DayFilter = "all" | "unscheduled" | number;

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tripAttachments, setTripAttachments] = useState<Attachment[]>([]);
  const [itemAttachments, setItemAttachments] = useState<Attachment[]>([]);
  const [view, setView] = useState<View>("table");
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeDay, setActiveDay] = useState<DayFilter>("all");
  const [extraDays, setExtraDays] = useState(0);
  const [openItem, setOpenItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, tripId]);

  async function load() {
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .maybeSingle();

    if (tripError) {
      setError(`讀取行程失敗:${tripError.message}`);
      return;
    }
    if (!tripData) {
      setNotFound(true);
      return;
    }
    setTrip(tripData as Trip);

    const { data: itemData, error: itemError } = await supabase
      .from("items")
      .select("*")
      .eq("trip_id", tripId)
      .order("sort_order");
    if (itemError) {
      setError(`讀取項目失敗:${itemError.message}`);
      return;
    }
    setItems((itemData as Item[]) ?? []);

    const { data: tripAtt, error: tripAttError } = await supabase
      .from("attachments")
      .select("*")
      .eq("trip_id", tripId);
    if (tripAttError) {
      setError(`讀取附件失敗:${tripAttError.message}`);
    } else {
      setTripAttachments((tripAtt as Attachment[]) ?? []);
    }

    const itemIds = ((itemData as Item[]) ?? []).map((i) => i.id);
    if (itemIds.length > 0) {
      const { data: itemAtt, error: itemAttError } = await supabase
        .from("attachments")
        .select("*")
        .in("item_id", itemIds);
      if (itemAttError) {
        setError(`讀取項目附件失敗:${itemAttError.message}`);
      } else {
        setItemAttachments((itemAtt as Attachment[]) ?? []);
      }
    } else {
      setItemAttachments([]);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const { error } = await supabase.from("items").insert({
      trip_id: tripId,
      title: newTitle.trim(),
      sort_order: items.length,
      day: typeof activeDay === "number" ? activeDay : null,
    });
    if (error) {
      setError(`新增項目失敗:${error.message}`);
      return;
    }
    setNewTitle("");
    void load();
  }

  const attachmentsByItem: Record<string, Attachment[]> = {};
  for (const a of itemAttachments) {
    if (!a.item_id) continue;
    (attachmentsByItem[a.item_id] ??= []).push(a);
  }

  const totalBudget = items.reduce((sum, i) => sum + (i.budget_amount ?? 0), 0);

  const maxDayUsed = items.reduce((max, i) => Math.max(max, i.day ?? 0), 0);
  const maxDay = Math.max(maxDayUsed, extraDays);
  const filteredItems =
    activeDay === "all"
      ? items
      : activeDay === "unscheduled"
      ? items.filter((i) => i.day == null)
      : items.filter((i) => i.day === activeDay);
  const openItemAttachments = openItem ? attachmentsByItem[openItem.id] ?? [] : [];

  if (authLoading || !user) {
    return <main className="p-10 text-center text-sm text-neutral-400">載入中…</main>;
  }

  if (notFound) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl px-6 py-10 text-sm text-neutral-500">
          <p>找不到這個行程,或你沒有權限查看(不是行程成員)。</p>
        </main>
      </AppShell>
    );
  }

  if (!trip) {
    return (
      <AppShell>
        <main className="p-10 text-center text-sm text-neutral-400">載入中…</main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

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

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
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

        <DayTabs
          maxDay={maxDay}
          activeDay={activeDay}
          onChange={setActiveDay}
          onAddDay={() => setExtraDays((n) => Math.max(n, maxDay) + 1)}
        />

        <form onSubmit={addItem} className="mb-4 flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={
              typeof activeDay === "number"
                ? `在第 ${activeDay} 天新增項目,例如「清水寺」`
                : "新增項目,例如「清水寺」"
            }
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
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-neutral-400">這天還沒有項目,上面新增一個吧。</p>
        ) : view === "table" ? (
          <ItemsTable items={filteredItems} onOpenItem={setOpenItem} onChange={load} />
        ) : (
          <ItemsCards
            items={filteredItems}
            attachmentsByItem={attachmentsByItem}
            onOpenItem={setOpenItem}
            onChange={load}
          />
        )}
      </main>

      {openItem && (
        <ItemDetailModal
          item={openItem}
          attachments={openItemAttachments}
          onChange={load}
          onClose={() => setOpenItem(null)}
        />
      )}
    </AppShell>
  );
}
