"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Repeat, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import type { AccentColor, FamilyEvent, Member } from "@/types";

const RECURRENCE_LABEL: Record<FamilyEvent["recurrence"], string | null> = {
  once: null,
  monthly: "每月",
  yearly: "每年",
};

export function EventCard({
  event,
  progress,
}: {
  event: FamilyEvent;
  progress?: { done: number; total: number };
}) {
  const router = useRouter();
  const { member, memberById } = useStore();
  const accent = ACCENT[event.color as AccentColor];
  const rec = RECURRENCE_LABEL[event.recurrence];

  // 主角展示：自己是主角→「您是主角」，否则列出角色名
  const subjectIds = event.subjectIds ?? [];
  const subjects = subjectIds.map((id) => memberById(id)).filter(Boolean) as Member[];
  const meIncluded = !!member && subjectIds.includes(member.id);
  const otherSubjects = subjects.filter((s) => s.id !== member?.id);
  const subjectLabel: string | null = (() => {
    if (subjects.length === 0) return null;
    if (meIncluded && otherSubjects.length === 0) return "您是主角";
    const parts: string[] = meIncluded ? ["您"] : [];
    for (const s of otherSubjects) parts.push(s.role);
    return `主角：${parts.join("、")}`;
  })();

  return (
    <button
      type="button"
      onClick={() => router.push(`/events/${event.id}`)}
      className={cn(
        "group flex w-full items-stretch gap-3 rounded-2xl bg-white/45 p-3 text-left backdrop-blur-sm transition active:scale-[0.99]",
        "border border-white/40",
      )}
    >
      <span className={cn("w-1.5 shrink-0 rounded-full", accent.dot)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-rose-deep">
            {event.title}
          </p>
          {rec && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white/50 px-1.5 py-0.5 text-[10px] text-rose-deep/60">
              <Repeat className="h-2.5 w-2.5" />
              {rec}
            </span>
          )}
        </div>
        {event.note && (
          <p className="mt-0.5 truncate text-xs text-rose-deep/55">{event.note}</p>
        )}
        {progress && progress.total > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-leaf-deep">
            <CheckCircle2 className="h-3 w-3" />
            <span>
              {progress.done}/{progress.total} 已完成
            </span>
          </div>
        )}
        {subjectLabel && (
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <Star className="h-3 w-3 shrink-0 text-amber-deep" />
            <span
              className={cn(
                "truncate",
                meIncluded ? "font-semibold text-amber-deep" : "text-rose-deep/55",
              )}
            >
              {subjectLabel}
            </span>
          </div>
        )}
      </div>
      <span className="self-center text-rose-deep/30 transition group-hover:translate-x-0.5">
        ›
      </span>
    </button>
  );
}
