export type FieldType = "text" | "number" | "date" | "select" | "url" | "checkbox";

export interface Trip {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  created_by: string;
  created_at: string;
}

export interface TripMember {
  trip_id: string;
  user_id: string;
  added_at: string;
}

export interface FieldDefinition {
  id: string;
  trip_id: string;
  field_key: string;
  field_label: string;
  field_type: FieldType;
  options: string[] | null;
  display_order: number;
}

export interface Item {
  id: string;
  trip_id: string;
  day: number | null;
  title: string;
  start_time: string | null;
  end_time: string | null;
  address: string | null;
  google_maps_url: string | null;
  notes: string | null;
  category: string | null;
  budget_amount: number | null;
  status: string | null;
  sort_order: number;
  custom_fields: Record<string, unknown>;
  created_at: string;
}

export interface Attachment {
  id: string;
  trip_id: string | null;
  item_id: string | null;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Checklist {
  id: string;
  trip_id: string;
  title: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  label: string;
  is_checked: boolean;
  assigned_to: string | null;
}

/** Builds a Google Maps search link from a free-text address. */
export function googleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}
