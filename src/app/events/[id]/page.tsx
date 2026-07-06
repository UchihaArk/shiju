"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Pencil, Repeat, Star, Trash2, User } from "lucide-react";
import { PhoneFrame } from "@/components/theme/PhoneFrame";
import { GlassCard } from "@/components/theme/GlassCard";
import { AccentChip } from "@/components/theme/AccentChip";
import { TaskList } from "@/components/event/TaskList";
import { useStore } from "@/lib/store";
import { Splash } from "@/components/ui/Splash";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";

const WEEKDAY = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const RECURRENCE: Record<string, string> = {
  once: "单次",
  monthly: "每月循环",
  yearly: "每年循环",
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { hydrated, member, events, memberById, tasksByEvent, deleteEvent } = useStore();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (hydrated && !member) router.replace("/login");
  }, [hydrated, member, router]);

  if (!hydrated || !member) return <Splash />;

  const event = events.find((e) => e.id === params.id);
  if (!event) {
    return (
      <PhoneFrame className="pt-14">
        <BackBar onBack={() => router.back()} />
        <GlassCard className="px-6 py-10 text-center">
          <p className="text-sm text-rose-deep/60">这个事项不存在或已被删除 🤔</p>
          <button
            type="button"
            onClick={() => router.replace("/home")}
            className="mt-4 rounded-full bg-rose px-4 py-2 text-xs font-medium text-white"
          >
            回到首页
          </button>
        </GlassCard>
      </PhoneFrame>
    );
  }

  const accent = ACCENT[event.color];
  const [y, m, d] = event.date.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const creator = memberById(event.createdBy);
  const subject = event.subjectId ? memberById(event.subjectId) : undefined;
  const evTasks = tasksByEvent(event.id);
  const canManage = event.createdBy === member.id;

  async function handleDelete() {
    await deleteEvent(event!.id);
    router.replace("/home");
  }

  return (
    <PhoneFrame className="pt-[calc(env(safe-area-inset-top)+14px)]">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {canManage && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => router.push(`/events/${event.id}/edit`)}
              aria-label="编辑"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="删除"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 事项头 */}
      <GlassCard strong className="mb-3 px-5 py-5">
        <div className="flex items-start gap-3">
          <span className={cn("mt-1 h-10 w-1.5 shrink-0 rounded-full", accent.dot)} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-snug text-rose-deep">{event.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <AccentChip color={event.color}>
                {m}月{d}日 · {WEEKDAY[date.getDay()]}
              </AccentChip>
              {event.recurrence !== "once" && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/50 px-2 py-0.5 text-[11px] text-rose-deep/60">
                  <Repeat className="h-2.5 w-2.5" />
                  {RECURRENCE[event.recurrence]}
                </span>
              )}
              {subject && (
                <AccentChip color={subject.color as never}>
                  <Star className="h-2.5 w-2.5" /> 主角 · {subject.role}
                </AccentChip>
              )}
            </div>
          </div>
        </div>

        {event.note && (
          <p className="mt-3 rounded-2xl bg-white/40 px-3 py-2 text-sm text-rose-deep/70">
            {event.note}
          </p>
        )}

        {creator && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-rose-deep/50">
            <User className="h-3 w-3" />
            <span>由 {creator.role} 发布</span>
          </div>
        )}
      </GlassCard>

      {/* 子任务认领 */}
      <TaskList tasks={evTasks} eventId={event.id} canManage={canManage} />

      <p className="mt-3 px-2 text-center text-[11px] text-rose-deep/40">
        全家多端同步 · 点击「认领」即时协作
      </p>

      {/* 删除确认 */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-deep/30 px-8 backdrop-blur-sm">
          <GlassCard strong className="w-full max-w-[300px] px-5 py-5 text-center">
            <p className="text-sm font-medium text-rose-deep">删除该事项？</p>
            <p className="mt-1 text-xs text-rose-deep/55">连同子任务一起删除，不可恢复</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-full bg-white/50 py-2 text-xs font-medium text-rose-deep active:scale-95"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-full bg-rose py-2 text-xs font-medium text-white active:scale-95"
              >
                删除
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </PhoneFrame>
  );
}

function BackBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="mb-3 flex items-center">
      <button
        type="button"
        onClick={onBack}
        aria-label="返回"
        className="grid h-9 w-9 place-items-center rounded-full bg-white/40 text-rose-deep backdrop-blur-sm active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
}
