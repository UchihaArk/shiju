"use client";

import { GlassCard } from "@/components/theme/GlassCard";
import { AccentChip } from "@/components/theme/AccentChip";
import { EventCard } from "@/components/event/EventCard";
import { useStore } from "@/lib/store";
import type { DayCalendar } from "@/types";

const WEEKDAY = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function DayDetail({ day }: { day: DayCalendar }) {
  const { tasks } = useStore();

  const pills: React.ReactNode[] = [];
  if (day.jieQi) pills.push(<AccentChip key="jq" color="leaf">🌿 {day.jieQi}</AccentChip>);
  if (day.holiday) {
    const h = day.holiday;
    const label = h.type === "workday" ? `💼 班 · ${h.name}` : `🏖️ 休 · ${h.name}`;
    pills.push(
      <AccentChip key="hol" color={h.type === "workday" ? "amber" : "rose"}>
        {label}
      </AccentChip>,
    );
  }
  for (const f of day.solarFestivals)
    pills.push(<AccentChip key={"sf" + f} color="rose">🎉 {f}</AccentChip>);
  for (const f of day.lunarFestivals)
    pills.push(<AccentChip key={"lf" + f} color="pink">🏮 {f}</AccentChip>);
  for (const mb of day.birthdays)
    pills.push(<AccentChip key={"bd" + mb.id} color="pink">🎂 {mb.role}生日</AccentChip>);

  return (
    <GlassCard strong className="mb-3 px-4 py-4">
      {/* 日期头 */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-deep">
              {day.m}月{day.d}日
            </span>
            <span className="text-sm text-rose-deep/55">{WEEKDAY[day.weekday]}</span>
          </div>
          <p className="mt-0.5 text-xs text-rose-deep/55">农历 {day.lunarText}</p>
        </div>
        {day.isToday && (
          <span className="rounded-full bg-rose/20 px-2 py-0.5 text-[11px] font-medium text-rose-deep">
            今天
          </span>
        )}
      </div>

      {/* 标签 */}
      {pills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">{pills}</div>
      )}

      {/* 事件列表 */}
      <div className="mt-3 space-y-2">
        {day.events.length === 0 ? (
          <p className="py-3 text-center text-xs text-rose-deep/40">
            这一天还没有安排 ✨
          </p>
        ) : (
          day.events.map((e) => {
            const evTasks = tasks.filter((t) => t.eventId === e.id);
            const done = evTasks.filter((t) => t.status === "done").length;
            return (
              <EventCard
                key={e.id}
                event={e}
                progress={evTasks.length ? { done, total: evTasks.length } : undefined}
              />
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
