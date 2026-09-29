"use client";

import { useRef, useState } from "react";
import { ATTACHMENTS_BUCKET, supabase } from "@/lib/supabaseClient";
import type { Attachment } from "@/lib/types";
import { AttachmentPreview } from "./AttachmentPreview";

/**
 * Upload + inline gallery for one trip's or one item's attachments.
 * Pass either `tripId` (trip-level docs) or `itemId` (per-card attachments),
 * matching the `attachments` table's check constraint.
 */
export function AttachmentUploader({
  tripId,
  itemId,
  attachments,
  onChange,
}: {
  tripId?: string;
  itemId?: string;
  attachments: Attachment[];
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      for (const file of Array.from(files)) {
        const path = `${tripId ?? itemId}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from(ATTACHMENTS_BUCKET)
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("attachments").insert({
          trip_id: tripId ?? null,
          item_id: itemId ?? null,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          uploaded_by: user?.id ?? null,
        });
        if (insertError) throw insertError;
      }
      onChange();
    } catch (err) {
      console.error(err);
      alert("上傳失敗,請再試一次。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(attachment: Attachment) {
    if (!confirm(`刪除「${attachment.file_name}」?`)) return;
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([attachment.storage_path]);
    await supabase.from("attachments").delete().eq("id", attachment.id);
    onChange();
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      {attachments.map((a) => (
        <AttachmentPreview key={a.id} attachment={a} onDelete={handleDelete} />
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50"
      >
        <span className="text-xl">{uploading ? "…" : "+"}</span>
        <span>{uploading ? "上傳中" : "加附件"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
