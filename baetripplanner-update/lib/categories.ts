export interface CategoryDef {
  value: string;
  label: string;
  icon: string;
  badgeClass: string;
}

/**
 * Shared category vocabulary used by the item table, cards, and detail
 * modal. Kept intentionally small and soft-toned (light pastel chips on a
 * white/neutral page) rather than TripMapper's saturated block colors —
 * Josef asked to keep the black-and-white minimal look and only use color
 * as a light accent for category recognition.
 */
export const CATEGORIES: CategoryDef[] = [
  { value: "flight", label: "交通/機票", icon: "✈️", badgeClass: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "transport", label: "接駁/市內交通", icon: "🚌", badgeClass: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "accommodation", label: "住宿", icon: "🏨", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "food", label: "餐飲", icon: "🍜", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "activity", label: "景點/活動", icon: "🎟️", badgeClass: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "shopping", label: "購物", icon: "🛍️", badgeClass: "bg-pink-50 text-pink-700 border-pink-200" },
  { value: "other", label: "其他", icon: "📌", badgeClass: "bg-neutral-100 text-neutral-600 border-neutral-200" },
];

export function getCategory(value: string | null): CategoryDef | null {
  if (!value) return null;
  return CATEGORIES.find((c) => c.value === value) ?? {
    value,
    label: value,
    icon: "📌",
    badgeClass: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };
}
