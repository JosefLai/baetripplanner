import { getCategory } from "@/lib/categories";

/** Small pastel icon+label chip — used in the table, cards, and modal header. */
export function CategoryBadge({ category }: { category: string | null }) {
  const c = getCategory(category);
  if (!c) return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${c.badgeClass}`}
    >
      <span aria-hidden>{c.icon}</span>
      {c.label}
    </span>
  );
}
