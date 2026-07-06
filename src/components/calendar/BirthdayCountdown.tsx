"use client";

import { Cake } from "lucide-react";
import { GlassCard } from "@/components/theme/GlassCard";
import { ACCENT } from "@/lib/colors";
import { birthdayCountdown } from "@/lib/lunar";
import { cn } from "@/lib/cn";
import type { Member } from "@/types";

function fmt(days: number): string {
  if (days === 0) return "就是今天";
  if (days === 1) return "明天";
  return `还有 ${days} 天`;
}

export function BirthdayCountdown({ members }: { members: Member[] }) {
  const upcoming = birthdayCountdown(members, 7);
  if (upcoming.length === 0) return null;

  return (
    <GlassCard className="mb-3 px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Cake className="h-4 w-4 text-pink-deep" />
        <span className="text-xs font-semibold text-rose-deep">近期生日</span>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {upcoming.map(({ member, days }) => {
          const accent = ACCENT[member.color];
          const isToday = days === 0;
          return (
            <div
              key={member.id}
              className={cn(
                "flex min-w-[120px] shrink-0 items-center gap-2 rounded-2xl px-3 py-2",
                isToday ? "bg-pink/25" : "bg-white/40",
              )}
            >
              <div
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl text-lg",
                  accent.soft,
                )}
              >
                {member.emoji}
              </div>
              <div className="leading-tight">
                <p className={cn("text-xs font-semibold", accent.text)}>
                  {member.role}
                </p>
                <p
                  className={cn(
                    "text-[11px]",
                    isToday ? "font-semibold text-pink-deep" : "text-rose-deep/60",
                  )}
                >
                  {isToday ? "🎂 " : ""}
                  {fmt(days)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
