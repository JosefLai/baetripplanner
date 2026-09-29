"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Item } from "@/lib/types";
import { googleMapsSearchUrl } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";

/**
 * Airtable-style editable grid. Every cell saves on blur — no separate
 * "edit mode" toggle, matching the feel of clicking into an Airtable cell.
 * Click "詳情" to open the full-field modal (address, notes, attachments…).
 */
export function ItemsTable({
  items,
  onOpenItem,
  onChange,
}: {
  items: Item[];
  onOpenItem: (item: Item) => void;
  onChange: () => void;
}) {
  async function updateField(id: string, field: keyof Item, value: unknown) {
    await supabase.from("items").update({ [field]: value || null }).eq("id", id);
    onChange();
  }

  async function deleteItem(id: string) {
    if (!confirm("刪除這個項目?")) return;
    await supabase.from("items").delete().eq("id", id);
    onChange();
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
          <tr>
            {["天數", "名稱", "分類", "開始", "結束", "地址", "地圖", "預算 (CAD)", "狀態", "", ""].map(
              (h) => (
                <th key={h} className="border-b border-neutral-200 px-3 py-2 font-medium">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50">
              <EditableCell
                value={item.day ?? ""}
                type="number"
                onSave={(v) => updateField(item.id, "day", v === "" ? null : Number(v))}
              />
              <EditableCell
                value={item.title}
                onSave={(v) => updateField(item.id, "title", v)}
              />
              <td className="px-1 py-1">
                <select
                  defaultValue={item.category ?? ""}
                  onChange={(e) => updateField(item.id, "category", e.target.value)}
                  className="w-full min-w-[110px] rounded px-2 py-1 text-sm hover:bg-neutral-100 focus:bg-white focus:outline focus:outline-1 focus:outline-neutral-400"
                >
                  <option value="">未分類</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </td>
              <EditableCell
                value={item.start_time ?? ""}
                type="time"
                onSave={(v) => updateField(item.id, "start_time", v)}
              />
              <EditableCell
                value={item.end_time ?? ""}
                type="time"
                onSave={(v) => updateField(item.id, "end_time", v)}
              />
              <EditableCell
                value={item.address ?? ""}
                onSave={(v) => updateField(item.id, "address", v)}
              />
              <td className="px-3 py-2">
                {item.address && (
                  <a
                    href={item.google_maps_url || googleMapsSearchUrl(item.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    開地圖
                  </a>
                )}
              </td>
              <EditableCell
                value={item.budget_amount ?? ""}
                type="number"
                onSave={(v) =>
                  updateField(item.id, "budget_amount", v === "" ? null : Number(v))
                }
              />
              <EditableCell
                value={item.status ?? ""}
                onSave={(v) => updateField(item.id, "status", v)}
              />
              <td className="px-3 py-2">
                <button
                  onClick={() => onOpenItem(item)}
                  className="text-neutral-500 hover:text-neutral-900 hover:underline"
                >
                  詳情
                </button>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-neutral-400 hover:text-red-600"
                  aria-label="刪除"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditableCell({
  value,
  onSave,
  type = "text",
}: {
  value: string | number;
  onSave: (value: string) => void;
  type?: string;
}) {
  return (
    <td className="px-1 py-1">
      <input
        type={type}
        defaultValue={value}
        onBlur={(e) => {
          if (e.target.value !== String(value)) onSave(e.target.value);
        }}
        className="w-full min-w-[80px] rounded px-2 py-1 text-sm hover:bg-neutral-100 focus:bg-white focus:outline focus:outline-1 focus:outline-neutral-400"
      />
    </td>
  );
}
