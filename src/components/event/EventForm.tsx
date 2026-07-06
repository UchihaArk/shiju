"use client";

import { useState } from "react";
import { Plus, Trash2, CalendarDays, Repeat, Palette, ListChecks, User } from "lucide-react";
import { GlassCard } from "@/components/theme/GlassCard";
import { useStore } from "@/lib/store";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { today, ymd } from "@/lib/date";
import { EVENT_TYPES, type EventTypeKey } from "@/lib/eventTypes";
import type { FamilyEvent } from "@/types";

const RECURRENCE_OPTIONS: { value: FamilyEvent["recurrence"]; label: string }[] = [
  { value: "once", label: "单次" },
  { value: "monthly", label: "每月" },
  { value: "yearly", label: "每年" },
];

/** 校验 "YYYY-MM-DD" 是否合法，合法则原样返回，否则 null。 */
function validDate(s?: string | null): string | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() + 1 !== m || dt.getDate() !== d) return null;
  return s;
}

export function EventForm({
  onDone,
  initialDate,
  event,
}: {
  onDone: () => void;
  initialDate?: string | null;
  event?: FamilyEvent;
}) {
  const { addEvent, updateEvent, members } = useStore();
  const editing = !!event;
  const now = today();

  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(
    () => event?.date ?? validDate(initialDate) ?? ymd(now.getFullYear(), now.getMonth() + 1, now.getDate()),
  );
  const [recurrence, setRecurrence] = useState<FamilyEvent["recurrence"]>(event?.recurrence ?? "once");
  const [eventType, setEventType] = useState<string>(event?.color ?? "regular");
  const [note, setNote] = useState(event?.note ?? "");
  const [subjectIds, setSubjectIds] = useState<string[]>(event?.subjectIds ?? []);
  const [subtasks, setSubtasks] = useState<{ title: string; assigneeId: string | null }[]>([
    { title: "", assigneeId: null },
  ]);
  const [submitting, setSubmitting] = useState(false);

  function setSubtask(i: number, v: string) {
    setSubtasks((prev) => prev.map((s, idx) => (idx === i ? { ...s, title: v } : s)));
  }
  function setSubtaskAssignee(i: number, assigneeId: string | null) {
    setSubtasks((prev) => prev.map((s, idx) => (idx === i ? { ...s, assigneeId } : s)));
  }
  function addSubtask() {
    setSubtasks((prev) => [...prev, { title: "", assigneeId: null }]);
  }
  function removeSubtask(i: number) {
    setSubtasks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      if (editing && event) {
        await updateEvent(event.id, { title, note, date, recurrence, color: eventType, subjectIds });
      } else {
        await addEvent({ title, note, date, recurrence, color: eventType, subjectIds, subtasks });
      }
      onDone();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 标题 */}
      <GlassCard className="px-4 py-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="事项标题，如：全家大扫除"
          className="w-full bg-transparent text-base font-semibold text-rose-deep placeholder:text-rose-deep/35 focus:outline-none"
        />
      </GlassCard>

      {/* 日期 */}
      <GlassCard className="flex items-center gap-3 px-4 py-3">
        <CalendarDays className="h-4 w-4 shrink-0 text-rose-deep/60" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-transparent text-sm text-rose-deep focus:outline-none"
        />
      </GlassCard>

      {/* 循环 */}
      <GlassCard className="px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-rose-deep/70">
          <Repeat className="h-3.5 w-3.5" />
          循环方式
        </div>
        <div className="flex gap-2">
          {RECURRENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRecurrence(opt.value)}
              className={cn(
                "flex-1 rounded-xl px-3 py-2 text-xs font-medium transition active:scale-95",
                recurrence === opt.value
                  ? "bg-gradient-to-br from-rose to-orange text-white shadow"
                  : "bg-white/40 text-rose-deep/60",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* 主角 / 围绕谁（多选，角色名） */}
      <GlassCard className="px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-rose-deep/70">
          <User className="h-3.5 w-3.5" />
          主角 / 围绕谁（可多选）
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const selected = subjectIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  setSubjectIds((prev) =>
                    selected ? prev.filter((x) => x !== m.id) : [...prev, m.id],
                  )
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95",
                  selected ? ACCENT[m.color].solid : "bg-white/40 text-rose-deep/55",
                )}
              >
                {m.role}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* 事件类型 */}
      <GlassCard className="px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-rose-deep/70">
          <Palette className="h-3.5 w-3.5" />
          事件类型
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EVENT_TYPES) as EventTypeKey[]).map((k) => {
            const t = EVENT_TYPES[k];
            const selected = eventType === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setEventType(k)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95",
                  selected ? ACCENT[t.color].solid : "bg-white/40 text-rose-deep/55",
                )}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* 备注 */}
      <GlassCard className="px-4 py-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="备注（可选）：时间、地点、注意事项…"
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-rose-deep placeholder:text-rose-deep/35 focus:outline-none"
        />
      </GlassCard>

      {/* 子任务（仅新建） */}
      {!editing && (
        <GlassCard className="px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-rose-deep/70">
            <ListChecks className="h-3.5 w-3.5" />
            子任务（家人可认领）
          </div>
          <div className="space-y-2">
            {subtasks.map((st, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    value={st.title}
                    onChange={(e) => setSubtask(i, e.target.value)}
                    placeholder={`子任务 ${i + 1}，如：买菜`}
                    className="w-full rounded-xl bg-white/45 px-3 py-2 text-sm text-rose-deep placeholder:text-rose-deep/35 focus:outline-none"
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubtask(i)}
                      aria-label="删除"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/40 text-rose-deep/50 active:scale-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <select
                  value={st.assigneeId ?? ""}
                  onChange={(e) => setSubtaskAssignee(i, e.target.value || null)}
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
            ))}
          </div>
          <button
            type="button"
            onClick={addSubtask}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/40 px-3 py-1.5 text-xs text-rose-deep active:scale-95"
          >
            <Plus className="h-3 w-3" /> 添加子任务
          </button>
        </GlassCard>
      )}

      {/* 提交 */}
      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className={cn(
          "w-full rounded-2xl py-3.5 text-sm font-semibold shadow-lg transition active:scale-[0.98]",
          title.trim() && !submitting
            ? "bg-gradient-to-br from-rose to-orange text-white"
            : "cursor-not-allowed bg-white/40 text-rose-deep/40",
        )}
      >
        {submitting ? (editing ? "保存中…" : "发布中…") : editing ? "保存修改" : "发布事项"}
      </button>
    </form>
  );
}
