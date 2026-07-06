"use client";

import { useState } from "react";
import { Check, Hand, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import type { Task } from "@/types";

export function TaskItem({ task, canManage }: { task: Task; canManage: boolean }) {
  const { member, memberById, claimTask, completeTask, updateTask, deleteTask, assignTask, members } =
    useStore();
  const accent = member ? ACCENT[member.color] : null;
  const assignee = memberById(task.assigneeId);
  const isMine = !!member && task.assigneeId === member.id;
  const isDone = task.status === "done";
  const isUnclaimed = task.status === "unclaimed";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [showAssign, setShowAssign] = useState(false);

  async function saveEdit() {
    const t = draft.trim();
    if (!t) return;
    try {
      await updateTask(task.id, t);
      setEditing(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function doAssign(uid: string) {
    try {
      await assignTask(task.id, uid);
      setShowAssign(false);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl px-3 py-2.5",
          isDone ? "bg-white/25" : "bg-white/45",
        )}
      >
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
          {isDone ? (
            <Check className="h-4 w-4" />
          ) : assignee ? (
            assignee.emoji
          ) : (
            <Hand className="h-3.5 w-3.5" />
          )}
        </span>

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") {
                setDraft(task.title);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 rounded-lg bg-white/70 px-2 py-1 text-sm text-rose-deep focus:outline-none"
          />
        ) : (
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm",
                isDone ? "text-rose-deep/40 line-through" : "font-medium text-rose-deep",
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
        )}

        {editing ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={saveEdit}
              aria-label="保存"
              className="grid h-7 w-7 place-items-center rounded-full bg-leaf text-white active:scale-90"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(task.title);
                setEditing(false);
              }}
              aria-label="取消"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/50 text-rose-deep active:scale-90"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            {!isDone && isUnclaimed && (
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
            {canManage && !isDone && (
              <div className="flex shrink-0 items-center gap-1">
                {isUnclaimed && (
                  <button
                    type="button"
                    onClick={() => setShowAssign((v) => !v)}
                    aria-label="指派"
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/50 text-rose-deep/60 active:scale-90"
                  >
                    <UserPlus className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label="编辑"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/50 text-rose-deep/60 active:scale-90"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label="删除"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/50 text-rose-deep/60 active:scale-90"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 指派认领人（发布者，未认领任务） */}
      {showAssign && canManage && isUnclaimed && (
        <div className="flex flex-wrap gap-1.5 pl-[60px]">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => doAssign(m.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition active:scale-95",
                ACCENT[m.color].solid,
              )}
            >
              {m.role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
