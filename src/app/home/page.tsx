"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { BirthdayCountdown } from "@/components/calendar/BirthdayCountdown";
import { EventCard } from "@/components/event/EventCard";
import { PushToggle } from "@/components/push/PushToggle";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { useStore } from "@/lib/store";
import { nextOccurrence, lunarTextOf } from "@/lib/lunar";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { today, ymd, daysBetween } from "@/lib/date";
import type { FamilyEvent } from "@/types";

const WEEKDAY = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function relLabel(date: Date, base: Date): string {
  const d = daysBetween(base, date);
  if (d === 0) return "今天";
  if (d === 1) return "明天";
  if (d === 2) return "后天";
  if (d <= 6) return `${d} 天后`;
  return "";
}

interface DateGroup {
  key: string;
  date: Date;
  events: FamilyEvent[];
}

export default function HomePage() {
  const router = useRouter();
  const { hydrated, member, members, events, tasks, logout, reload } = useStore();

  const now = today();
  const todayKey = ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());

  useEffect(() => {
    if (hydrated && !member) router.replace("/login");
  }, [hydrated, member, router]);

  if (!hydrated || !member) return null;
  const accent = ACCENT[member.color];

  // 今天往后的所有事项（循环事项取下一次发生）
  const groups: DateGroup[] = [];
  for (const e of events) {
    const date = nextOccurrence(e, now);
    if (!date) continue;
    const key = ymd(date.getFullYear(), date.getMonth() + 1, date.getDate());
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, date: new Date(date), events: [] };
      groups.push(g);
    }
    g.events.push(e);
  }
  groups.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <>
      <div className="mx-auto flex h-dvh w-full max-w-[430px] flex-col px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
        {/* 顶栏 */}
        <header className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
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
              onClick={() => router.push(`/events/new?date=${todayKey}`)}
              aria-label="新建事项"
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rose to-orange text-white shadow active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="mt-3 shrink-0">
          <h1 className="px-1 text-xl font-bold text-rose-deep">家庭事项</h1>
          <p className="px-1 text-[11px] text-rose-deep/50">今天往后的全部安排</p>
        </div>

        {/* 生日提醒置顶（7 天内无人则隐藏） */}
        <div className="mt-3 shrink-0">
          <BirthdayCountdown members={members} />
        </div>

        {/* 可滚动事件列表（下拉刷新） */}
        <PullToRefresh onRefresh={reload} className="no-scrollbar mt-2 flex-1 overflow-y-auto pb-28">
          {groups.length === 0 ? (
            <p className="py-16 text-center text-sm text-rose-deep/40">
              今天往后暂无安排 ✨
            </p>
          ) : (
            groups.map((g) => {
              const rel = relLabel(g.date, now);
              const m = g.date.getMonth() + 1;
              const d = g.date.getDate();
              const primary = rel || `${m}月${d}日`;
              const secondary = rel ? `${m}月${d}日 ${WEEKDAY[g.date.getDay()]}` : WEEKDAY[g.date.getDay()];
              return (
                <section key={g.key} className="mb-1">
                  <div className="sticky top-0 z-10 mb-2 flex items-baseline gap-2 rounded-xl bg-white/45 px-2 py-1.5 backdrop-blur-sm">
                    <span className="text-sm font-bold text-rose-deep">{primary}</span>
                    <span className="text-[11px] text-rose-deep/55">{secondary}</span>
                    <span className="ml-auto text-[10px] text-rose-deep/45">
                      农历 {lunarTextOf(g.date)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {g.events.map((e) => {
                      const evTasks = tasks.filter((t) => t.eventId === e.id);
                      const done = evTasks.filter((t) => t.status === "done").length;
                      return (
                        <EventCard
                          key={e.id}
                          event={e}
                          progress={evTasks.length ? { done, total: evTasks.length } : undefined}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </PullToRefresh>
      </div>
    </>
  );
}
