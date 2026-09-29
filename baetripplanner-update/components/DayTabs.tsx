"use client";

/**
 * Day-by-day pill navigation, similar to TripMapper's date strip at the
 * bottom of the trip screen. `activeDay`: "all" | "unscheduled" | number.
 */
export function DayTabs({
  maxDay,
  activeDay,
  onChange,
  onAddDay,
}: {
  maxDay: number;
  activeDay: "all" | "unscheduled" | number;
  onChange: (day: "all" | "unscheduled" | number) => void;
  onAddDay: () => void;
}) {
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  function pillClass(active: boolean) {
    return `shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
    }`;
  }

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
      <button onClick={() => onChange("all")} className={pillClass(activeDay === "all")}>
        全部
      </button>
      {days.map((d) => (
        <button key={d} onClick={() => onChange(d)} className={pillClass(activeDay === d)}>
          第 {d} 天
        </button>
      ))}
      <button
        onClick={() => onChange("unscheduled")}
        className={pillClass(activeDay === "unscheduled")}
      >
        未排定
      </button>
      <button
        onClick={onAddDay}
        className="shrink-0 rounded-full border border-dashed border-neutral-300 px-3 py-1.5 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
      >
        + 新增一天
      </button>
    </div>
  );
}
