"use client";

import { useState } from "react";
import type { Attachment, Item } from "@/lib/types";
import { googleMapsSearchUrl } from "@/lib/types";
import { AttachmentUploader } from "./AttachmentUploader";
import { supabase } from "@/lib/supabaseClient";

/** Card / gallery view — the mobile-friendly counterpart to the grid. */
export function ItemsCards({
  items,
  attachmentsByItem,
  onChange,
}: {
  items: Item[];
  attachmentsByItem: Record<string, Attachment[]>;
  onChange: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          attachments={attachmentsByItem[item.id] ?? []}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function ItemCard({
  item,
  attachments,
  onChange,
}: {
  item: Item;
  attachments: Attachment[];
  onChange: () => void;
}) {
  const [notes, setNotes] = useState(item.notes ?? "");

  async function saveNotes() {
    if (notes !== (item.notes ?? "")) {
      await supabase.from("items").update({ notes }).eq("id", item.id);
      onChange();
    }
  }

  const mapsUrl = item.address
    ? item.google_maps_url || googleMapsSearchUrl(item.address)
    : null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-neutral-500">
            {item.day != null && `第 ${item.day} 天 · `}
            {item.start_time ?? ""}
            {item.end_time ? ` – ${item.end_time}` : ""}
          </p>
        </div>
        {item.category && (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
            {item.category}
          </span>
        )}
      </div>

      {item.address && (
        <p className="mb-2 text-sm text-neutral-600">
          📍 {item.address}{" "}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              在 Google 地圖開啟
            </a>
          )}
        </p>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={saveNotes}
        placeholder="備註…"
        rows={2}
        className="mb-3 w-full resize-none rounded-lg border border-neutral-200 px-2 py-1 text-sm"
      />

      {item.budget_amount != null && (
        <p className="mb-3 text-sm text-neutral-700">
          預算:CAD {item.budget_amount.toFixed(2)}
        </p>
      )}

      <AttachmentUploader itemId={item.id} attachments={attachments} onChange={onChange} />
    </div>
  );
}
