import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Makes the misconfiguration obvious in the browser console instead of a
  // silent failed fetch.
  console.warn(
    "Supabase env vars are missing. Copy .env.local.example to .env.local and fill them in."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ATTACHMENTS_BUCKET = "trip-attachments";

export function publicAttachmentUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}
