"use client";

import { DayCell } from "./DayCell";
import { cn } from "@/lib/cn";
import type { DayCalendar } from "@/types";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function CalendarGrid({
  days,
  selectedKey,
  onSelect,
}: {
  days: DayCalendar[];
  selectedKey: string;
  onSelect: (day: DayCalendar) => void;
}) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "py-1 text-center text-[11px] font-medium",
              i === 0 || i === 6 ? "text-rose/80" : "text-rose-deep/50",
            )}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <DayCell
            key={day.solarDate}
            day={day}
            selected={day.solarDate === selectedKey}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
