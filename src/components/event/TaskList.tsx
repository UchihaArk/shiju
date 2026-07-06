"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { GlassCard } from "@/components/theme/GlassCard";
import { useStore } from "@/lib/store";
import type { Task } from "@/types";

export function TaskList({
  tasks,
  eventId,
  canManage,
}: {
  tasks: Task[];
  eventId: string;
  canManage: boolean;
}) {
  const { addTask, members } = useStore();
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  async function handleAdd() {
    const t = newTitle.trim();
    if (!t) return;
    try {
      await addTask(eventId, t, newAssignee || null);
      setNewTitle("");
      setNewAssignee("");
    } catch (e) {
      console.error(e);
    }
  }

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
          tasks.map((t) => <TaskItem key={t.id} task={t} canManage={canManage} />)
        )}
      </div>

      {canManage && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="新增子任务…"
              className="w-full rounded-xl bg-white/45 px-3 py-2 text-sm text-rose-deep placeholder:text-rose-deep/35 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAdd}
              aria-label="添加子任务"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose text-white active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <select
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="w-full rounded-xl bg-white/45 px-3 py-1.5 text-xs text-rose-deep focus:outline-none"
          >
            <option value="">指派给：无人（等待认领）</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                指派给：{m.role}
              </option>
            ))}
          </select>
        </div>
      )}
    </GlassCard>
  );
}
