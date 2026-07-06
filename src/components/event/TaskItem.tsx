"use client";

import { Check, Hand } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import type { Task } from "@/types";

export function TaskItem({ task }: { task: Task }) {
  const { member, memberById, claimTask, completeTask } = useStore();
  const accent = member ? ACCENT[member.color] : null;
  const assignee = memberById(task.assigneeId);
  const isMine = member && task.assigneeId === member.id;
  const isDone = task.status === "done";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5",
        isDone ? "bg-white/25" : "bg-white/45",
      )}
    >
      {/* 状态图标 */}
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs",
          isDone
            ? "bg-leaf/30 text-leaf-deep"
            : task.status === "claimed"
              ? "bg-amber/30 text-amber-deep"
              : "bg-rose/15 text-rose-deep/60",
        )}
      >
        {isDone ? <Check className="h-4 w-4" /> : assignee ? assignee.emoji : <Hand className="h-3.5 w-3.5" />}
      </span>

      {/* 标题 + 认领人 */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm",
            isDone
              ? "text-rose-deep/40 line-through"
              : "font-medium text-rose-deep",
          )}
        >
          {task.title}
        </p>
        <p className="text-[11px] text-rose-deep/50">
          {isDone
            ? `${assignee?.role ?? "家人"} · 已完成`
            : task.status === "claimed"
              ? `${assignee?.role ?? "家人"}已认领${isMine ? "（你）" : ""}`
              : "等待认领"}
        </p>
      </div>

      {/* 操作按钮 */}
      {!isDone && task.status === "unclaimed" && (
        <button
          type="button"
          onClick={() => claimTask(task.id)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-sm active:scale-95",
            accent?.solid ?? "bg-rose text-white",
          )}
        >
          认领
        </button>
      )}
      {!isDone && isMine && (
        <button
          type="button"
          onClick={() => completeTask(task.id)}
          className="shrink-0 rounded-full bg-leaf px-3 py-1.5 text-xs font-medium text-white shadow-sm active:scale-95"
        >
          完成
        </button>
      )}
    </div>
  );
}
