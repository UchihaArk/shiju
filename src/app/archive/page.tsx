"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/theme/AppShell";
import { GlassCard } from "@/components/theme/GlassCard";
import { EventCard } from "@/components/event/EventCard";
import { useStore } from "@/lib/store";
import { occurrencesInRange, lunarTextOf } from "@/lib/lunar";
import { today, ymd } from "@/lib/date";
import { cn } from "@/lib/cn";
import { Splash } from "@/components/ui/Splash";
import type { FamilyEvent } from "@/types";

type Granularity = "year" | "quarter" | "month";
const WEEKDAY = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const GRAN_LABEL: Record<Granularity, string> = { year: "年度", quarter: "季度", month: "月度" };

function periodRange(
  g: Granularity,
  year: number,
  quarter: number,
  month: number,
): { start: Date; end: Date } {
  if (g === "year") return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
  if (g === "quarter") {
    const sm = (quarter - 1) * 3;
    return { start: new Date(year, sm, 1), end: new Date(year, sm + 3, 0) };
  }
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
}

interface Item { event: FamilyEvent; date: Date }

export default function ArchivePage() {
  const router = useRouter();
  const { hydrated, member, events, tasks } = useStore();
  const now = today();
  const [g, setG] = useState<Granularity>("year");
  const [year, setYear] = useState(now.getFullYear());
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth() / 3) + 1);
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    if (hydrated && !member) router.replace("/login");
  }, [hydrated, member, router]);

  const { start, end } = periodRange(g, year, quarter, month);
  const byMonth = g !== "month";
  // 全部事项只展示「已发生」的（今天及之前），未来的不显示
  const viewEnd = end.getTime() < now.getTime() ? end : now;

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    for (const e of events) {
      for (const d of occurrencesInRange(e, start, viewEnd)) list.push({ event: e, date: d });
    }
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
    return list;
  }, [events, start, viewEnd]);

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; date: Date; items: Item[] }>();
    for (const it of items) {
      const key = byMonth
        ? `${it.date.getFullYear()}-${String(it.date.getMonth() + 1).padStart(2, "0")}`
        : ymd(it.date.getFullYear(), it.date.getMonth() + 1, it.date.getDate());
      let grp = map.get(key);
      if (!grp) {
        grp = { key, date: it.date, items: [] };
        map.set(key, grp);
      }
      grp.items.push(it);
    }
    return [...map.values()];
  }, [items, byMonth]);

  if (!hydrated || !member) return <Splash />;

  const summary =
    g === "year"
      ? `${year}年`
      : g === "quarter"
        ? `${year}年 · Q${quarter}（${(quarter - 1) * 3 + 1}-${(quarter - 1) * 3 + 3}月）`
        : `${year}年 ${month}月`;

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  return (
    <AppShell
      top={
        <>
          <h1 className="mb-1 px-1 text-xl font-bold text-rose-deep">全部事项</h1>
          <p className="mb-1 px-1 text-[11px] text-rose-deep/50">按 年度 / 季度 / 月度 查询全部事项</p>
        </>
      }
    >
        {/* 粒度切换 */}
        <GlassCard className="mb-3 p-1.5">
          <div className="flex gap-1">
            {(Object.keys(GRAN_LABEL) as Granularity[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setG(k)}
                className={cn(
                  "flex-1 rounded-2xl py-2 text-xs font-medium transition active:scale-95",
                  g === k
                    ? "bg-gradient-to-br from-rose to-orange text-white shadow"
                    : "text-rose-deep/55",
                )}
              >
                {GRAN_LABEL[k]}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* 时段选择 */}
        <GlassCard className="mb-3 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              aria-label="上一年"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/40 text-rose-deep active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-rose-deep">{year} 年</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              aria-label="下一年"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/40 text-rose-deep active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {g === "quarter" && (
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuarter(q)}
                  className={cn(
                    "rounded-xl py-1.5 text-xs font-medium transition active:scale-95",
                    quarter === q
                      ? "bg-rose text-white"
                      : "bg-white/40 text-rose-deep/55",
                  )}
                >
                  Q{q}
                </button>
              ))}
            </div>
          )}

          {g === "month" && (
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="上个月"
                className="grid h-7 w-7 place-items-center rounded-full bg-white/40 text-rose-deep active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-rose-deep">{month} 月</span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="下个月"
                className="grid h-7 w-7 place-items-center rounded-full bg-white/40 text-rose-deep active:scale-90"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </GlassCard>

        {/* 汇总 */}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs text-rose-deep/55">{summary}</span>
          <span className="text-xs text-rose-deep/55">共 {items.length} 项</span>
        </div>

        {/* 分组列表 */}
        {groups.length === 0 ? (
          <GlassCard className="px-6 py-10 text-center text-sm text-rose-deep/40">
            该时段暂无事项
          </GlassCard>
        ) : (
          groups.map((grp) => (
            <div key={grp.key} className="mb-3">
              <div className="mb-2 flex items-baseline gap-2 px-1">
                <span className="text-sm font-bold text-rose-deep">
                  {byMonth
                    ? `${grp.date.getMonth() + 1} 月`
                    : `${grp.date.getMonth() + 1}月${grp.date.getDate()}日`}
                </span>
                {!byMonth && (
                  <span className="text-[11px] text-rose-deep/45">
                    {WEEKDAY[grp.date.getDay()]} · 农历 {lunarTextOf(grp.date)}
                  </span>
                )}
                {byMonth && <span className="text-[11px] text-rose-deep/45">{grp.items.length} 项</span>}
              </div>
              <div className="space-y-2">
                {grp.items.map(({ event, date }) => {
                  const evTasks = tasks.filter((t) => t.eventId === event.id);
                  const done = evTasks.filter((t) => t.status === "done").length;
                  return (
                    <EventCard
                      key={event.id + "@" + ymd(date.getFullYear(), date.getMonth() + 1, date.getDate())}
                      event={event}
                      progress={evTasks.length ? { done, total: evTasks.length } : undefined}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </AppShell>
  );
}
