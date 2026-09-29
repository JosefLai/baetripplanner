"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Attachment, Item } from "@/lib/types";
import { googleMapsSearchUrl } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { AttachmentUploader } from "./AttachmentUploader";

/**
 * Full-detail edit view for one item — opened by clicking a row (table view)
 * or a card (card view). Every field saves on blur/change, same
 * Airtable-style pattern as the inline table, just with room for every
 * column plus attachments in one place instead of a cramped row.
 */
export function ItemDetailModal({
  item,
  attachments,
  onChange,
  onClose,
}: {
  item: Item;
  attachments: Attachment[];
  onChange: () => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(item);
  const [deleting, setDeleting] = useState(false);

  async function save(field: keyof Item, value: unknown) {
    setLocal((prev) => ({ ...prev, [field]: value }));
    await supabase
      .from("items")
      .update({ [field]: value === "" ? null : value })
      .eq("id", item.id);
    onChange();
  }

  async function handleDelete() {
    if (!confirm(`刪除「${item.title}」?`)) return;
    setDeleting(true);
    await supabase.from("items").delete().eq("id", item.id);
    setDeleting(false);
    onChange();
    onClose();
  }

  const mapsUrl = local.address ? local.google_maps_url || googleMapsSearchUrl(local.address) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <input
            defaultValue={local.title}
            onBlur={(e) => e.target.value.trim() && save("title", e.target.value.trim())}
            className="w-full rounded-lg px-2 py-1 text-lg font-semibold hover:bg-neutral-100 focus:bg-white focus:outline focus:outline-1 focus:outline-neutral-300"
          />
          <button
            onClick={onClose}
            aria-label="關閉"
            className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="分類">
            <select
              defaultValue={local.category ?? ""}
              onChange={(e) => save("category", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">未分類</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="天數">
            <input
              type="number"
              min={1}
              defaultValue={local.day ?? ""}
              onBlur={(e) => save("day", e.target.value === "" ? null : Number(e.target.value))}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
              placeholder="未排定"
            />
          </Field>

          <Field label="開始時間">
            <input
              type="time"
              defaultValue={local.start_time ?? ""}
              onBlur={(e) => save("start_time", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </Field>

          <Field label="結束時間">
            <input
              type="time"
              defaultValue={local.end_time ?? ""}
              onBlur={(e) => save("end_time", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </Field>

          <Field label="預算 (CAD)">
            <input
              type="number"
              step="0.01"
              defaultValue={local.budget_amount ?? ""}
              onBlur={(e) =>
                save("budget_amount", e.target.value === "" ? null : Number(e.target.value))
              }
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </Field>

          <Field label="狀態">
            <input
              defaultValue={local.status ?? ""}
              onBlur={(e) => save("status", e.target.value)}
              placeholder="例如:已確認"
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </Field>
        </div>

        <Field label="地址" className="mt-3">
          <input
            defaultValue={local.address ?? ""}
            onBlur={(e) => save("address", e.target.value)}
            placeholder="貼上地址,會自動產生地圖連結"
            className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </Field>

        <Field label="自訂地圖連結(選填)" className="mt-3">
          <input
            defaultValue={local.google_maps_url ?? ""}
            onBlur={(e) => save("google_maps_url", e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </Field>

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            📍 在 Google 地圖開啟
          </a>
        )}

        <Field label="備註" className="mt-3">
          <textarea
            defaultValue={local.notes ?? ""}
            onBlur={(e) => save("notes", e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </Field>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-neutral-500">附件</p>
          <AttachmentUploader itemId={item.id} attachments={attachments} onChange={onChange} />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting ? "刪除中…" : "刪除這個項目"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-xs font-medium text-neutral-500">{label}</p>
      {children}
    </div>
  );
}
