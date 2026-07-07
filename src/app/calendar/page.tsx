"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/theme/AppShell";
import { GlassCard } from "@/components/theme/GlassCard";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayDetail } from "@/components/calendar/DayDetail";
import { PushToggle } from "@/components/push/PushToggle";
import { useStore } from "@/lib/store";
import { getMonthCalendar } from "@/lib/lunar";
import { api } from "@/lib/api";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { today, ymd } from "@/lib/date";
import type { DayCalendar, HolidayInfo } from "@/types";

const CN_MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

function shiftMonth(y: number, m: number, delta: number) {
  const d = new Date(y, m - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function CalendarPage() {
  const router = useRouter();
  const { hydrated, member, members, events } = useStore();

  const now = today();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [selectedKey, setSelectedKey] = useState(
    ymd(now.getFullYear(), now.getMonth() + 1, now.getDate()),
  );
  const detailRef = useRef<HTMLDivElement>(null);
  const [holidays, setHolidays] = useState<Record<string, HolidayInfo>>({});

  useEffect(() => {
    if (hydrated && !member) router.replace("/login");
  }, [hydrated, member, router]);

  // 拉取视图年（及跨年相邻月）的节假日
  useEffect(() => {
    const years = new Set<number>([view.year]);
    if (view.month === 1) years.add(view.year - 1);
    if (view.month === 12) years.add(view.year + 1);
    (async () => {
      const merged: Record<string, HolidayInfo> = {};
      for (const y of years) {
        try {
          for (const h of await api.holidays(y)) {
            merged[h.date] = { type: h.type, name: h.name };
          }
        } catch {
          /* 后端未同步则无节假日标记 */
        }
      }
      setHolidays(merged);
    })();
  }, [view.year, view.month]);

  const days = useMemo(
    () => getMonthCalendar(view.year, view.month, { events, members, holidays }),
    [view, events, members, holidays],
  );

  const selectedDay: DayCalendar =
    days.find((d) => d.solarDate === selectedKey) ?? days.find((d) => d.inMonth) ?? days[0];

  function changeMonth(delta: number) {
    const next = shiftMonth(view.year, view.month, delta);
    setView(next);
    const isCurMonth =
      next.year === now.getFullYear() && next.month === now.getMonth() + 1;
    setSelectedKey(
      isCurMonth
        ? ymd(now.getFullYear(), now.getMonth() + 1, now.getDate())
        : ymd(next.year, next.month, 1),
    );
  }

  function selectDay(d: DayCalendar) {
    setSelectedKey(d.solarDate);
    // 事件区在日历底部，切换日期后滚到事件区
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (!hydrated || !member) return null;
  const accent = ACCENT[member.color];

  return (
    <AppShell
      top={
        <>
          {/* 顶栏 */}
          <header className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 rounded-full bg-white/40 py-1 pl-1 pr-3 backdrop-blur-sm active:scale-95"
            >
              <span className={cn("grid h-8 w-8 place-items-center rounded-full text-lg", accent.soft)}>
                {member.emoji}
              </span>
              <span className="text-xs font-medium text-rose-deep">{member.role}</span>
            </button>
            <div className="flex items-center gap-1">
              <PushToggle />
              <button
                type="button"
                onClick={() => router.push(`/events/new?date=${selectedKey}`)}
                aria-label="新建事项"
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rose to-orange text-white shadow active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* 标题 + 月份切换 */}
          <div className="mb-1 flex items-center justify-between px-1">
            <div>
              <h1 className="text-xl font-bold text-rose-deep">
                {view.year}年 {CN_MONTHS[view.month - 1]}
              </h1>
              <p className="text-[11px] text-rose-deep/50">家庭全景日历</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="上个月"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="下个月"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      }
    >
      {/* 月历 */}
      <GlassCard className="px-3 py-3">
        <CalendarGrid days={days} selectedKey={selectedDay.solarDate} onSelect={selectDay} />
      </GlassCard>

      {/* 事件区：日历底部 */}
      <div ref={detailRef} className="mt-3 scroll-mt-3">
        <DayDetail day={selectedDay} />
      </div>
    </AppShell>
  );
}
