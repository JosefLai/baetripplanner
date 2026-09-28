"use client";

import { useRef, useState } from "react";
import { ATTACHMENTS_BUCKET, publicAttachmentUrl, supabase } from "@/lib/supabaseClient";

/**
 * Trip cover photo — an uploadable image, not a pasted URL. Uploads to the
 * same public "trip-attachments" bucket under covers/<tripId>/, then writes
 * the resulting public URL onto trips.cover_image_url.
 */
export function CoverImageUpload({
  tripId,
  currentUrl,
  onChange,
}: {
  tripId: string;
  currentUrl: string | null;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const path = `covers/${tripId}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const url = publicAttachmentUrl(path);
      const { error: updateError } = await supabase
        .from("trips")
        .update({ cover_image_url: url })
        .eq("id", tripId);
      if (updateError) throw updateError;

      onChange(url);
    } catch (err) {
      console.error(err);
      alert("封面照片上傳失敗,請再試一次。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="group relative block h-40 w-full overflow-hidden rounded-xl bg-neutral-100"
    >
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="封面照片" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-400">
          尚未設定封面照片
        </div>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
        {uploading ? "上傳中…" : "點擊更換封面照片"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
}
