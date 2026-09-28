"use client";

import { useState } from "react";
import { publicAttachmentUrl } from "@/lib/supabaseClient";
import type { Attachment } from "@/lib/types";

/**
 * Renders an attachment so it can be looked at in the browser — image, PDF,
 * video, audio — without ever forcing a download. Anything else falls back
 * to a file chip that opens the file in a new tab (still a "view", not a
 * download, since there's no `download` attribute anywhere here).
 *
 * Works the same on desktop and mobile: modern mobile browsers (Safari iOS,
 * Chrome Android) render <img>, <video>, <audio> and PDF-in-<iframe> inline
 * just like desktop does.
 */
export function AttachmentPreview({
  attachment,
  onDelete,
}: {
  attachment: Attachment;
  onDelete?: (attachment: Attachment) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const url = publicAttachmentUrl(attachment.storage_path);
  const mime = attachment.mime_type ?? "";

  const body = () => {
    if (mime.startsWith("image/")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={attachment.file_name}
          className="h-28 w-full rounded-lg object-cover cursor-zoom-in"
          onClick={() => setExpanded(true)}
        />
      );
    }
    if (mime === "application/pdf") {
      return (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
        >
          <span className="text-2xl">📄</span>
          <span className="mt-1 max-w-[90%] truncate text-xs">
            {attachment.file_name}
          </span>
        </button>
      );
    }
    if (mime.startsWith("video/")) {
      return (
        <video
          src={url}
          controls
          preload="metadata"
          className="h-28 w-full rounded-lg bg-black object-contain"
        />
      );
    }
    if (mime.startsWith("audio/")) {
      return (
        <div className="flex h-28 w-full flex-col justify-center gap-1 rounded-lg border border-neutral-200 p-2">
          <span className="truncate text-xs text-neutral-600">
            {attachment.file_name}
          </span>
          <audio src={url} controls className="w-full" />
        </div>
      );
    }
    // Generic fallback: open in a new tab so the browser's own viewer/handler
    // takes over — no `download` attribute, so it previews rather than saves.
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
      >
        <span className="text-2xl">📎</span>
        <span className="mt-1 max-w-[90%] truncate text-xs">
          {attachment.file_name}
        </span>
      </a>
    );
  };

  return (
    <div className="relative w-28 shrink-0">
      {body()}
      {onDelete && (
        <button
          type="button"
          aria-label="移除附件"
          onClick={() => onDelete(attachment)}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white shadow"
        >
          ×
        </button>
      )}

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-2 text-sm">
              <span className="truncate">{attachment.file_name}</span>
              <button onClick={() => setExpanded(false)} aria-label="關閉">
                ✕
              </button>
            </div>
            <div className="h-[80vh] w-full bg-neutral-100">
              {mime === "application/pdf" ? (
                <iframe src={url} title={attachment.file_name} className="h-full w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={attachment.file_name}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
