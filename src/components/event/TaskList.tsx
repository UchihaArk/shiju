"use client";

import { TaskItem } from "./TaskItem";
import { GlassCard } from "@/components/theme/GlassCard";
import type { Task } from "@/types";

export function TaskList({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <GlassCard className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-rose-deep">子任务</h3>
        <span className="text-xs text-rose-deep/55">
          {done}/{total} 已完成
        </span>
      </div>

      {total > 0 && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-leaf to-leaf/70 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="space-y-2">
        {total === 0 ? (
          <p className="py-3 text-center text-xs text-rose-deep/40">
            还没有子任务，家人可以认领后协作完成
          </p>
        ) : (
          tasks.map((t) => <TaskItem key={t.id} task={t} />)
        )}
      </div>
    </GlassCard>
  );
}
