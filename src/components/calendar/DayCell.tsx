"use client";

import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import type { DayCalendar } from "@/types";

/** 网格小字优先级：节气 > 节日(名) > 调休(班) > 假期(休) > 农历日。
 *  节日当天名称由 lunar-typescript 的 getFestivals() 给出（元旦/春节/清明/劳动节/端午/中秋/国庆）。 */
function dayLabel(day: DayCalendar): { text: string; cls: string } {
  if (day.jieQi) return { text: day.jieQi, cls: "text-leaf-deep font-medium" };
  const festival = day.solarFestivals[0] || day.lunarFestivals[0];
  if (festival) return { text: festival, cls: "text-rose-deep font-medium" };
  if (day.holiday) {
    if (day.holiday.type === "workday")
      return { text: "班", cls: "text-rose-deep font-semibold" };
    return { text: "休", cls: "text-leaf-deep font-semibold" };
  }
  return { text: day.lunarDayText, cls: "text-rose-deep/45" };
}

export function DayCell({
  day,
  selected,
  onSelect,
}: {
  day: DayCalendar;
  selected: boolean;
  onSelect: (day: DayCalendar) => void;
}) {
  const label = dayLabel(day);
  const dots = day.events.slice(0, 3);
  const extra = day.events.length - dots.length;
  const hasBirthday = day.birthdays.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-start rounded-xl px-1 pt-1 transition",
        "border border-transparent",
        selected ? "bg-white/70 ring-1 ring-rose/50" : "active:bg-white/40",
        !day.inMonth && "opacity-40",
      )}
    >
      {/* 日期数字 */}
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 place-items-center rounded-full text-[13px] leading-none",
          day.isToday
            ? "bg-gradient-to-br from-rose to-orange font-bold text-white shadow"
            : "text-rose-deep",
        )}
      >
        {day.d}
      </span>

      {/* 小字（节气/假日/农历） */}
      <span className={cn("mt-0.5 max-w-full truncate text-[9px] leading-none", label.cls)}>
        {label.text}
      </span>

      {/* 生日标记 */}
      {hasBirthday && (
        <span className="absolute right-1 top-1 text-[9px]">🎂</span>
      )}

      {/* 事件色点 */}
      {dots.length > 0 && (
        <div className="mt-auto mb-1 flex items-center gap-0.5">
          {dots.map((e) => (
            <span
              key={e.id}
              className={cn("h-1 w-1 rounded-full", ACCENT[e.color].dot)}
            />
          ))}
          {extra > 0 && (
            <span className="text-[8px] text-rose-deep/50">+{extra}</span>
          )}
        </div>
      )}
    </button>
  );
}
