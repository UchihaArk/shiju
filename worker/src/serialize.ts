import type { events, tasks, users } from "./schema";
import type { EventDTO, MemberDTO, TaskDTO } from "./types";

type UserRow = typeof users.$inferSelect;
type TaskRow = typeof tasks.$inferSelect;
type EventRow = typeof events.$inferSelect;

export function toMember(r: UserRow): MemberDTO {
  return {
    id: r.id,
    name: r.name,
    shortName: r.shortName,
    role: r.role,
    emoji: r.emoji,
    color: r.color,
    birthdayType: r.birthdayType as MemberDTO["birthdayType"],
    birthday: { month: r.birthdayMonth, day: r.birthdayDay },
  };
}

export function toTask(r: TaskRow): TaskDTO {
  return {
    id: r.id,
    eventId: r.eventId,
    title: r.title,
    assigneeId: r.assigneeId,
    status: r.status as TaskDTO["status"],
    claimedAt: r.claimedAt,
    doneAt: r.doneAt,
  };
}

export function toEvent(r: EventRow, taskIds: string[]): EventDTO {
  let subjectIds: string[] = [];
  if (r.subjectIds) {
    try {
      const parsed = JSON.parse(r.subjectIds);
      if (Array.isArray(parsed)) subjectIds = parsed.filter((x): x is string => typeof x === "string");
    } catch {
      subjectIds = [];
    }
  }
  return {
    id: r.id,
    title: r.title,
    note: r.note ?? undefined,
    date: r.date,
    recurrence: r.recurrence as EventDTO["recurrence"],
    createdBy: r.createdBy,
    color: r.color,
    subjectIds,
    taskIds,
  };
}
