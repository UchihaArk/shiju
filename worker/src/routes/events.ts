import { Hono } from "hono";
import { getDb } from "../db";
import { events, tasks } from "../schema";
import { toEvent, toTask } from "../serialize";
import { requireMember } from "../auth";
import type { AppEnv, MemberDTO } from "../types";

export const eventsRouter = new Hono<{
  Bindings: AppEnv;
  Variables: { member: MemberDTO };
}>();
eventsRouter.use("*", requireMember);

/** 列出全部事项（含 taskIds）。 */
eventsRouter.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const [eventRows, taskRows] = await Promise.all([
    db.select().from(events).all(),
    db.select().from(tasks).all(),
  ]);
  const idsByEvent = new Map<string, string[]>();
  for (const t of taskRows) {
    const arr = idsByEvent.get(t.eventId) ?? [];
    arr.push(t.id);
    idsByEvent.set(t.eventId, arr);
  }
  return c.json(eventRows.map((e) => toEvent(e, idsByEvent.get(e.id) ?? [])));
});

/** 新建事项（含子任务一并建，状态 unclaimed）。 */
eventsRouter.post("/", async (c) => {
  const member = c.get("member");
  const body = await c.req.json<{
    title: string;
    note?: string;
    date: string;
    recurrence: "once" | "monthly" | "yearly";
    color: string;
    subtasks?: string[];
  }>();

  if (!body.title?.trim()) return c.json({ error: "title required" }, 400);

  const db = getDb(c.env.DB);
  const eventId = `e_${Date.now()}`;
  const now = Date.now();
  const subtaskRows = (body.subtasks ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .map((title, i) => ({
      id: `t_${now}_${i}`,
      eventId,
      title,
      assigneeId: null,
      status: "unclaimed" as const,
      claimedAt: null,
      doneAt: null,
    }));

  await db.batch([
    db.insert(events).values({
      id: eventId,
      title: body.title.trim(),
      note: body.note?.trim() || null,
      date: body.date,
      recurrence: body.recurrence,
      createdBy: member.id,
      color: body.color,
    }),
    ...subtaskRows.map((t) => db.insert(tasks).values(t)),
  ]);

  return c.json(
    {
      event: toEvent(
        {
          id: eventId,
          title: body.title.trim(),
          note: body.note?.trim() || null,
          date: body.date,
          recurrence: body.recurrence,
          createdBy: member.id,
          color: body.color,
        },
        subtaskRows.map((t) => t.id),
      ),
      tasks: subtaskRows.map(toTask),
    },
    201,
  );
});
